import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { generatePayrollPDF } from '../services/pdfService.js';
import path from 'path';

const router = express.Router();

// Generate payroll for a specific month
router.post('/generate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Get all active users
    const users = await db.allAsync('SELECT * FROM users WHERE is_active = 1');

    // Get salary components
    const salaryComponents = await db.allAsync('SELECT * FROM salary_components WHERE is_active = 1');

    const results = [];

    for (const user of users) {
      // Check if payroll already exists
      const existingPayroll = await db.getAsync(
        'SELECT id FROM payrolls WHERE user_id = ? AND month = ? AND year = ?',
        [user.id, month, year]
      );

      if (existingPayroll) {
        continue; // Skip if payroll already generated
      }

      // Count articles published in the month
      const articlesResult = await db.getAsync(`
        SELECT COUNT(*) as count, SUM(views) as total_views
        FROM articles 
        WHERE author_id = ? 
        AND status = 'published'
        AND strftime('%m', published_at) = ? 
        AND strftime('%Y', published_at) = ?
      `, [user.id, month.toString().padStart(2, '0'), year.toString()]);

      const articlesCount = articlesResult.count || 0;
      const totalViews = articlesResult.total_views || 0;

      // Calculate salary
      let totalSalary = 0;
      let bonusViewsAmount = 0;

      for (const component of salaryComponents) {
        switch (component.type) {
          case 'fixed':
            totalSalary += component.value;
            break;
          case 'per_article':
            totalSalary += component.value * articlesCount;
            break;
          case 'percentage':
            bonusViewsAmount = Math.floor(totalViews / 1000) * component.value;
            totalSalary += bonusViewsAmount;
            break;
        }
      }

      // Default deductions (tax, etc.)
      const deductions = totalSalary * 0.05; // 5% tax
      const finalTotal = totalSalary - deductions;

      // Generate PDF
      const pdfFilename = `payroll_${user.id}_${year}_${month}.pdf`;
      const pdfPath = await generatePayrollPDF({
        user,
        month,
        year,
        articlesCount,
        bonusViewsAmount,
        totalSalary,
        deductions,
        finalTotal,
        filename: pdfFilename
      });

      // Store payroll record
      const result = await db.runAsync(`
        INSERT INTO payrolls 
        (user_id, month, year, articles_count, bonus_views_amount, deductions, total, pdf_url, encrypted_password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user.id, month, year, articlesCount, bonusViewsAmount, deductions, finalTotal, pdfPath, user.nik || '12345']);

      results.push({
        userId: user.id,
        userName: user.name,
        payrollId: result.lastID,
        articlesCount,
        totalSalary: finalTotal,
        pdfPath
      });
    }

    res.json({
      message: 'Payroll generated successfully',
      results
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payrolls
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, month, year } = req.query;
    
    let query = `
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM payrolls p
      JOIN users u ON p.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];

    // Role-based access control
    if (req.user.role !== 'admin') {
      conditions.push('p.user_id = ?');
      params.push(req.user.id);
    } else if (user_id) {
      conditions.push('p.user_id = ?');
      params.push(user_id);
    }

    if (month) {
      conditions.push('p.month = ?');
      params.push(month);
    }

    if (year) {
      conditions.push('p.year = ?');
      params.push(year);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.year DESC, p.month DESC';

    const payrolls = await db.allAsync(query, params);

    res.json(payrolls);
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download payroll PDF
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const payrollId = req.params.id;

    const payroll = await db.getAsync(`
      SELECT p.*, u.name as user_name
      FROM payrolls p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [payrollId]);

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    // Role-based access control
    if (req.user.role !== 'admin' && payroll.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if PDF file exists
    const fs = await import('fs');
    if (!fs.existsSync(payroll.pdf_url)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(payroll.pdf_url, `slip_gaji_${payroll.user_name}_${payroll.year}_${payroll.month}.pdf`);
  } catch (error) {
    console.error('Download payroll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get salary components
router.get('/components', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const components = await db.allAsync('SELECT * FROM salary_components ORDER BY id');
    res.json(components);
  } catch (error) {
    console.error('Get salary components error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update salary components
router.put('/components/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, type, value, is_active } = req.body;
    const componentId = req.params.id;

    await db.runAsync(
      'UPDATE salary_components SET name = ?, type = ?, value = ?, is_active = ? WHERE id = ?',
      [name, type, value, is_active ? 1 : 0, componentId]
    );

    res.json({ message: 'Salary component updated successfully' });
  } catch (error) {
    console.error('Update salary component error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;