import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get settings (public - limited)
router.get('/public', async (req, res) => {
  try {
    const settings = await db.allAsync(`
      SELECT key, value 
      FROM site_settings 
      WHERE key IN ('site_name', 'site_description', 'news_ticker_text')
    `);

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all settings (admin)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const settings = await db.allAsync('SELECT * FROM site_settings ORDER BY key');
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings
router.put('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await db.runAsync(`
        INSERT OR REPLACE INTO site_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [key, value]);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get site statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};

    // Total articles
    const articlesCount = await db.getAsync('SELECT COUNT(*) as count FROM articles WHERE status = "published"');
    stats.totalArticles = articlesCount.count;

    // Total users
    const usersCount = await db.getAsync('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    stats.totalUsers = usersCount.count;

    // Total views
    const viewsCount = await db.getAsync('SELECT SUM(views) as total FROM articles');
    stats.totalViews = viewsCount.total || 0;

    // Articles by category
    const categoryStats = await db.allAsync(`
      SELECT c.name, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    stats.articlesByCategory = categoryStats;

    // Recent activity
    const recentActivity = await db.allAsync(`
      SELECT l.*, u.name as user_name
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
      LIMIT 10
    `);
    stats.recentActivity = recentActivity;

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;