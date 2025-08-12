import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

// Get ads by position (public)
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    
    const ads = await db.allAsync(`
      SELECT * FROM ads 
      WHERE position = ? AND is_active = 1 
      AND (start_date IS NULL OR start_date <= DATE('now'))
      AND (end_date IS NULL OR end_date >= DATE('now'))
      ORDER BY RANDOM()
      LIMIT 1
    `, [position]);

    res.json(ads[0] || null);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all ads (admin)
router.get('/', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const ads = await db.allAsync('SELECT * FROM ads ORDER BY created_at DESC');
    res.json(ads);
  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create ad
router.post('/', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { name, type, content, position, is_active = true, start_date, end_date } = req.body;

    if (!name || !type || !content || !position) {
      return res.status(400).json({ error: 'Name, type, content, and position are required' });
    }

    if (!['script', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either script or image' });
    }

    if (!['header', 'sidebar', 'article', 'footer'].includes(position)) {
      return res.status(400).json({ error: 'Invalid position' });
    }

    // Sanitize script content if type is script
    let sanitizedContent = content;
    if (type === 'script') {
      sanitizedContent = sanitizeHtml(content, {
        allowedTags: ['script', 'div', 'img', 'a', 'iframe'],
        allowedAttributes: {
          'script': ['src', 'type', 'async', 'defer'],
          'div': ['class', 'id', 'style'],
          'img': ['src', 'alt', 'width', 'height', 'class'],
          'a': ['href', 'target', 'class'],
          'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
        },
        allowedSchemes: ['http', 'https', 'mailto']
      });
    }

    const result = await db.runAsync(
      'INSERT INTO ads (name, type, content, position, is_active, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, sanitizedContent, position, is_active ? 1 : 0, start_date, end_date]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Ad created successfully'
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ad
router.put('/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { name, type, content, position, is_active, start_date, end_date } = req.body;
    const adId = req.params.id;

    // Sanitize script content if type is script
    let sanitizedContent = content;
    if (type === 'script') {
      sanitizedContent = sanitizeHtml(content, {
        allowedTags: ['script', 'div', 'img', 'a', 'iframe'],
        allowedAttributes: {
          'script': ['src', 'type', 'async', 'defer'],
          'div': ['class', 'id', 'style'],
          'img': ['src', 'alt', 'width', 'height', 'class'],
          'a': ['href', 'target', 'class'],
          'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
        },
        allowedSchemes: ['http', 'https', 'mailto']
      });
    }

    await db.runAsync(
      'UPDATE ads SET name = ?, type = ?, content = ?, position = ?, is_active = ?, start_date = ?, end_date = ? WHERE id = ?',
      [name, type, sanitizedContent, position, is_active ? 1 : 0, start_date, end_date, adId]
    );

    res.json({ message: 'Ad updated successfully' });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ad
router.delete('/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const adId = req.params.id;

    await db.runAsync('DELETE FROM ads WHERE id = ?', [adId]);

    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;