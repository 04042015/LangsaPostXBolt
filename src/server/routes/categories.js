import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await db.allAsync('SELECT * FROM categories ORDER BY order_index ASC');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { name, slug, icon, order_index = 0 } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const result = await db.runAsync(
      'INSERT INTO categories (name, slug, icon, order_index) VALUES (?, ?, ?, ?)',
      [name, slug, icon, order_index]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Category slug must be unique' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { name, slug, icon, order_index } = req.body;
    const categoryId = req.params.id;

    await db.runAsync(
      'UPDATE categories SET name = ?, slug = ?, icon = ?, order_index = ? WHERE id = ?',
      [name, slug, icon, order_index, categoryId]
    );

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category has articles
    const articlesCount = await db.getAsync(
      'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
      [categoryId]
    );

    if (articlesCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${articlesCount.count} articles are using this category.` 
      });
    }

    await db.runAsync('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;