import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload media
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const result = await db.runAsync(
      'INSERT INTO media (filename, url, type, size, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [req.file.filename, fileUrl, req.file.mimetype, req.file.size, req.user.id]
    );

    res.status(201).json({
      id: result.lastID,
      filename: req.file.filename,
      url: fileUrl,
      type: req.file.mimetype,
      size: req.file.size,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get media files
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, u.name as uploaded_by_name
      FROM media m
      JOIN users u ON m.uploaded_by = u.id
    `;
    
    const params = [];

    if (type) {
      query += ' WHERE m.type LIKE ?';
      params.push(`${type}%`);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const media = await db.allAsync(query, params);

    res.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mediaId = req.params.id;

    const media = await db.getAsync('SELECT * FROM media WHERE id = ?', [mediaId]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && media.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own uploads' });
    }

    // Delete file from filesystem
    const fs = await import('fs');
    const filePath = path.join(__dirname, '../../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.runAsync('DELETE FROM media WHERE id = ?', [mediaId]);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;