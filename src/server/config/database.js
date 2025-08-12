import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

export const initDatabase = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'editor', 'writer')) DEFAULT 'writer',
      nik TEXT UNIQUE,
      phone TEXT,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      featured_image TEXT,
      status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      views INTEGER DEFAULT 0,
      is_headline BOOLEAN DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('script', 'image')) NOT NULL,
      content TEXT NOT NULL,
      position TEXT CHECK(position IN ('header', 'sidebar', 'article', 'footer')) NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      start_date DATE,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS salary_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('fixed', 'per_article', 'percentage')) NOT NULL,
      value DECIMAL(10,2) NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS payrolls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      articles_count INTEGER DEFAULT 0,
      bonus_views_amount DECIMAL(10,2) DEFAULT 0,
      deductions DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      pdf_url TEXT,
      encrypted_password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      meta_json TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      type TEXT DEFAULT 'string',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    await db.runAsync(table);
  }

  // Insert default data
  await insertDefaultData();
};

const insertDefaultData = async () => {
  // Check if admin user exists
  const adminExists = await db.getAsync('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    await db.runAsync(
      'INSERT INTO users (name, email, password_hash, role, nik) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@langsapost.test', hashedPassword, 'admin', 'ADM001']
    );
    console.log('✅ Default admin user created');
  }

  // Insert default categories
  const categories = [
    { name: 'Politik', slug: 'politik', icon: 'Vote' },
    { name: 'Ekonomi', slug: 'ekonomi', icon: 'TrendingUp' },
    { name: 'Olahraga', slug: 'olahraga', icon: 'Trophy' },
    { name: 'Teknologi', slug: 'teknologi', icon: 'Smartphone' },
    { name: 'Kesehatan', slug: 'kesehatan', icon: 'Heart' },
    { name: 'Internasional', slug: 'internasional', icon: 'Globe' },
    { name: 'Nasional', slug: 'nasional', icon: 'Flag' },
    { name: 'Hiburan', slug: 'hiburan', icon: 'Music' },
    { name: 'Pendidikan', slug: 'pendidikan', icon: 'BookOpen' },
    { name: 'Otomotif', slug: 'otomotif', icon: 'Car' },
    { name: 'Langsa', slug: 'langsa', icon: 'MapPin' },
    { name: 'Loker', slug: 'loker', icon: 'Briefcase' },
    { name: 'Zodiak', slug: 'zodiak', icon: 'Star' }
  ];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const exists = await db.getAsync('SELECT id FROM categories WHERE slug = ?', [category.slug]);
    
    if (!exists) {
      await db.runAsync(
        'INSERT INTO categories (name, slug, icon, order_index) VALUES (?, ?, ?, ?)',
        [category.name, category.slug, category.icon, i + 1]
      );
    }
  }

  // Insert default salary components
  const salaryComponents = [
    { name: 'Gaji Pokok', type: 'fixed', value: 3000000 },
    { name: 'Bonus Per Artikel', type: 'per_article', value: 50000 },
    { name: 'Bonus Views (per 1000)', type: 'percentage', value: 10000 }
  ];

  for (const component of salaryComponents) {
    const exists = await db.getAsync('SELECT id FROM salary_components WHERE name = ?', [component.name]);
    
    if (!exists) {
      await db.runAsync(
        'INSERT INTO salary_components (name, type, value) VALUES (?, ?, ?)',
        [component.name, component.type, component.value]
      );
    }
  }

  // Insert default site settings
  const settings = [
    { key: 'site_name', value: 'LangsaPost' },
    { key: 'site_description', value: 'Portal Berita Terpercaya Langsa dan Sekitarnya' },
    { key: 'contact_email', value: 'info@langsapost.com' },
    { key: 'contact_phone', value: '+62 812-3456-7890' },
    { key: 'news_ticker_text', value: 'Selamat datang di LangsaPost - Portal berita terpercaya untuk informasi terkini Langsa dan sekitarnya' },
    { key: 'payroll_date', value: '25' }
  ];

  for (const setting of settings) {
    const exists = await db.getAsync('SELECT id FROM site_settings WHERE key = ?', [setting.key]);
    
    if (!exists) {
      await db.runAsync(
        'INSERT INTO site_settings (key, value) VALUES (?, ?)',
        [setting.key, setting.value]
      );
    }
  }
};

export { db };