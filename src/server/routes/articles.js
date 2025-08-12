import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

// Get articles (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sort = 'latest',
      featured = false 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `
      SELECT a.*, u.name as author_name, c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
    `;
    
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (a.title LIKE ? OR a.excerpt LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      query += ' AND a.is_headline = 1';
    }

    // Sort options
    switch (sort) {
      case 'popular':
        query += ' ORDER BY a.views DESC';
        break;
      case 'oldest':
        query += ' ORDER BY a.published_at ASC';
        break;
      default:
        query += ' ORDER BY a.published_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const articles = await db.allAsync(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
    `;
    
    const countParams = [];
    if (category) {
      countQuery += ' AND c.slug = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (a.title LIKE ? OR a.excerpt LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      countQuery += ' AND a.is_headline = 1';
    }

    const { total } = await db.getAsync(countQuery, countParams);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single article (public)
router.get('/:slug', async (req, res) => {
  try {
    const article = await db.getAsync(`
      SELECT a.*, u.name as author_name, c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.slug = ? AND a.status = 'published'
    `, [req.params.slug]);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    await db.runAsync('UPDATE articles SET views = views + 1 WHERE id = ?', [article.id]);
    article.views += 1;

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create article
router.post('/', authenticateToken, requireRole(['admin', 'editor', 'writer']), async (req, res) => {
  try {
    const { title, content, excerpt, category_id, featured_image, is_headline = false } = req.body;

    if (!title || !content || !category_id) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Create slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'a', 'img'],
      allowedAttributes: {
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height']
      }
    });

    const result = await db.runAsync(`
      INSERT INTO articles (title, slug, content, excerpt, author_id, category_id, featured_image, is_headline, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
    `, [title, slug, sanitizedContent, excerpt, req.user.id, category_id, featured_image, is_headline ? 1 : 0]);

    res.status(201).json({
      id: result.lastID,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Create article error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Article slug must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update article
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, category_id, featured_image, is_headline, status } = req.body;
    const articleId = req.params.id;

    // Check if user can edit this article
    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [articleId]);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Role-based access control
    if (req.user.role === 'writer' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own articles' });
    }

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'a', 'img'],
      allowedAttributes: {
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height']
      }
    });

    await db.runAsync(`
      UPDATE articles 
      SET title = ?, content = ?, excerpt = ?, category_id = ?, featured_image = ?, 
          is_headline = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, sanitizedContent, excerpt, category_id, featured_image, is_headline ? 1 : 0, status, articleId]);

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete article
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const articleId = req.params.id;

    // Check if user can delete this article
    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [articleId]);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Role-based access control
    if (req.user.role === 'writer' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own articles' });
    }

    await db.runAsync('DELETE FROM articles WHERE id = ?', [articleId]);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin articles (with drafts)
router.get('/admin/list', authenticateToken, requireRole(['admin', 'editor', 'writer']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, author } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, u.name as author_name, c.name as category_name
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
    `;
    
    const params = [];
    const conditions = [];

    // Role-based filtering
    if (req.user.role === 'writer') {
      conditions.push('a.author_id = ?');
      params.push(req.user.id);
    }

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (author && req.user.role !== 'writer') {
      conditions.push('a.author_id = ?');
      params.push(author);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const articles = await db.allAsync(query, params);

    res.json({ articles });
  } catch (error) {
    console.error('Get admin articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;