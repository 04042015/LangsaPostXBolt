import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePayrollPDF = async (data) => {
  try {
    const { user, month, year, articlesCount, bonusViewsAmount, totalSalary, deductions, finalTotal, filename } = data;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(1, 0.31, 0.31); // #ff4f4f
    const textColor = rgb(0.2, 0.2, 0.2);
    const grayColor = rgb(0.5, 0.5, 0.5);

    // Header
    page.drawText('LANGSAPOST', {
      x: 50,
      y: height - 80,
      size: 24,
      font: boldFont,
      color: primaryColor,
    });

    page.drawText('SLIP GAJI KARYAWAN', {
      x: 50,
      y: height - 110,
      size: 16,
      font: boldFont,
      color: textColor,
    });

    // Employee info
    let yPosition = height - 160;
    const lineHeight = 20;

    const employeeInfo = [
      ['Nama', ': ' + user.name],
      ['NIK', ': ' + (user.nik || '-')],
      ['Email', ': ' + user.email],
      ['Periode', `: ${getMonthName(month)} ${year}`],
      ['Tanggal Cetak', ': ' + new Date().toLocaleDateString('id-ID')]
    ];

    employeeInfo.forEach(([label, value]) => {
      page.drawText(label, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: textColor,
      });

      page.drawText(value, {
        x: 150,
        y: yPosition,
        size: 11,
        font: font,
        color: textColor,
      });

      yPosition -= lineHeight;
    });

    // Salary details
    yPosition -= 20;
    page.drawText('RINCIAN GAJI', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textColor,
    });

    yPosition -= 30;

    const salaryDetails = [
      ['Gaji Pokok', formatCurrency(3000000)],
      [`Bonus Artikel (${articlesCount} artikel)`, formatCurrency(articlesCount * 50000)],
      ['Bonus Views', formatCurrency(bonusViewsAmount)],
      ['', ''],
      ['TOTAL GAJI KOTOR', formatCurrency(totalSalary)],
      ['', ''],
      ['POTONGAN:', ''],
      ['Pajak (5%)', formatCurrency(deductions)],
      ['', ''],
      ['TOTAL GAJI BERSIH', formatCurrency(finalTotal)]
    ];

    salaryDetails.forEach(([label, value], index) => {
      if (label === '' && value === '') {
        yPosition -= 10;
        return;
      }

      const isTotal = label.includes('TOTAL');
      const currentFont = isTotal ? boldFont : font;
      const currentSize = isTotal ? 12 : 11;

      if (label === 'POTONGAN:') {
        page.drawText(label, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: textColor,
        });
      } else {
        page.drawText(label, {
          x: label.startsWith(' ') ? 70 : 50,
          y: yPosition,
          size: currentSize,
          font: currentFont,
          color: textColor,
        });

        if (value) {
          page.drawText(value, {
            x: 400,
            y: yPosition,
            size: currentSize,
            font: currentFont,
            color: textColor,
          });
        }
      }

      if (isTotal && label.includes('BERSIH')) {
        // Draw line above final total
        page.drawLine({
          start: { x: 50, y: yPosition + 15 },
          end: { x: 500, y: yPosition + 15 },
          thickness: 1,
          color: textColor,
        });
      }

      yPosition -= lineHeight;
    });

    // Footer
    yPosition = 150;
    page.drawText('Catatan: Slip gaji ini dihasilkan secara otomatis oleh sistem.', {
      x: 50,
      y: yPosition,
      size: 9,
      font: font,
      color: grayColor,
    });

    page.drawText('Untuk pertanyaan, hubungi HRD di info@langsapost.com', {
      x: 50,
      y: yPosition - 15,
      size: 9,
      font: font,
      color: grayColor,
    });

    // Generate PDF
    const pdfBytes = await pdfDoc.save();

    // Save to file
    const uploadsDir = path.join(__dirname, '../../uploads/payroll');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const getMonthName = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[parseInt(month) - 1];
};