import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get users
router.get('/', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT id, name, email, role, nik, phone, avatar_url, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role, nik, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['admin', 'editor', 'writer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.runAsync(
      'INSERT INTO users (name, email, password_hash, role, nik, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, nik, phone]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email or NIK already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, role, nik, phone, is_active } = req.body;
    const userId = req.params.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Non-admin users cannot change role or is_active
    let updateFields = ['name = ?', 'email = ?', 'nik = ?', 'phone = ?', 'updated_at = CURRENT_TIMESTAMP'];
    let params = [name, email, nik, phone];

    if (req.user.role === 'admin') {
      updateFields.push('role = ?', 'is_active = ?');
      params.push(role, is_active);
    }

    params.push(userId);

    await db.runAsync(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'You can only change your own password' });
    }

    const user = await db.getAsync('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For non-admin users, verify current password
    if (req.user.role !== 'admin') {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.runAsync(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user has articles
    const articlesCount = await db.getAsync(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ?',
      [userId]
    );

    if (articlesCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user. ${articlesCount.count} articles are authored by this user.` 
      });
    }

    await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;