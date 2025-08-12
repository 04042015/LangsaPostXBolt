import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  news_ticker_text: string;
  payroll_date: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    news_ticker_text: '',
    payroll_date: '25'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Pengaturan berhasil disimpan');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Situs</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Informasi Situs
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Situs
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="LangsaPost"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi Situs
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Portal berita terpercaya..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teks News Ticker
              </label>
              <textarea
                value={settings.news_ticker_text}
                onChange={(e) => handleChange('news_ticker_text', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Selamat datang di LangsaPost..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Teks yang berjalan di bagian atas situs
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Informasi Kontak
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Kontak
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="info@langsapost.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+62 812-3456-7890"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pengaturan Sistem
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Gajian (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={settings.payroll_date}
                onChange={(e) => handleChange('payroll_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tanggal otomatis generate slip gaji setiap bulan
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aksi Cepat
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={() => window.open('/', '_blank')}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Globe size={16} className="mr-2" />
              Lihat Situs
            </button>
            
            <button
              onClick={() => {
                const confirmed = confirm('Apakah Anda yakin ingin membersihkan cache?');
                if (confirmed) {
                  // In a real app, this would clear server-side cache
                  alert('Cache berhasil dibersihkan');
                }
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Bersihkan Cache
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informasi Sistem
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Versi Sistem</p>
            <p className="font-medium text-gray-900 dark:text-white">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Database</p>
            <p className="font-medium text-gray-900 dark:text-white">SQLite</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Server</p>
            <p className="font-medium text-gray-900 dark:text-white">Node.js + Express</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;