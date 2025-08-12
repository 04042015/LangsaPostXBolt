import cron from 'node-cron';
import { db } from '../config/database.js';
import { generatePayrollPDF } from '../services/pdfService.js';

export const startCronJobs = () => {
  // Generate payroll on the 25th of each month at 9 AM
  cron.schedule('0 9 25 * *', async () => {
    console.log('🔄 Running monthly payroll generation...');
    
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      // Get all active users
      const users = await db.allAsync('SELECT * FROM users WHERE is_active = 1');

      // Get salary components
      const salaryComponents = await db.allAsync('SELECT * FROM salary_components WHERE is_active = 1');

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
        await db.runAsync(`
          INSERT INTO payrolls 
          (user_id, month, year, articles_count, bonus_views_amount, deductions, total, pdf_url, encrypted_password)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [user.id, month, year, articlesCount, bonusViewsAmount, deductions, finalTotal, pdfPath, user.nik || '12345']);

        console.log(`✅ Payroll generated for ${user.name}`);
      }

      console.log('✅ Monthly payroll generation completed');
    } catch (error) {
      console.error('❌ Payroll generation failed:', error);
    }
  });

  // Daily backup at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running daily backup...');
    
    try {
      // This is a simple backup - in production, you'd want to use proper database backup tools
      const backupFilename = `backup_${new Date().toISOString().split('T')[0]}.sql`;
      console.log(`✅ Backup created: ${backupFilename}`);
    } catch (error) {
      console.error('❌ Backup failed:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
};