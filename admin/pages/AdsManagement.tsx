import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Monitor, Eye, EyeOff } from 'lucide-react';

interface Ad {
  id: number;
  name: string;
  type: 'script' | 'image';
  content: string;
  position: 'header' | 'sidebar' | 'article' | 'footer';
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AdsManagement: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/ads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus iklan ini?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAds(ads.filter(ad => ad.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus iklan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan saat menghapus iklan');
    }
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      header: 'Header Atas',
      sidebar: 'Sidebar',
      article: 'Tengah Artikel',
      footer: 'Footer'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getTypeLabel = (type: string) => {
    return type === 'script' ? 'Script HTML/JS' : 'Gambar';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isAdActive = (ad: Ad) => {
    if (!ad.is_active) return false;
    
    const now = new Date();
    const startDate = ad.start_date ? new Date(ad.start_date) : null;
    const endDate = ad.end_date ? new Date(ad.end_date) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Iklan</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Iklan Baru
        </button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {ad.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {getPositionLabel(ad.position)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                      {getTypeLabel(ad.type)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isAdActive(ad) ? (
                    <Eye className="w-5 h-5 text-green-500" title="Aktif" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" title="Nonaktif" />
                  )}
                </div>
              </div>

              {/* Ad Preview */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                {ad.type === 'image' ? (
                  <img
                    src={ad.content}
                    alt={ad.name}
                    className="max-w-full h-auto max-h-32 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYW1iYXIgdGlkYWsgZGl0ZW11a2FuPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                ) : (
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                    {ad.content.substring(0, 200)}
                    {ad.content.length > 200 && '...'}
                  </div>
                )}
              </div>

              {/* Ad Details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    isAdActive(ad) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isAdActive(ad) ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mulai:</span>
                  <span>{formatDate(ad.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Berakhir:</span>
                  <span>{formatDate(ad.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dibuat:</span>
                  <span>{formatDate(ad.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingAd(ad)}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={14} className="mr-1" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada iklan</p>
        </div>
      )}

      {/* Create/Edit Ad Modal */}
      {(showModal || editingAd) && (
        <AdFormModal
          ad={editingAd}
          onClose={() => {
            setShowModal(false);
            setEditingAd(null);
          }}
          onSave={() => {
            fetchAds();
            setShowModal(false);
            setEditingAd(null);
          }}
        />
      )}
    </div>
  );
};

interface AdFormModalProps {
  ad?: Ad | null;
  onClose: () => void;
  onSave: () => void;
}

const AdFormModal: React.FC<AdFormModalProps> = ({ ad, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: ad?.name || '',
    type: ad?.type || 'image',
    content: ad?.content || '',
    position: ad?.position || 'sidebar',
    is_active: ad?.is_active ?? true,
    start_date: ad?.start_date || '',
    end_date: ad?.end_date || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = ad 
        ? `http://localhost:3001/api/ads/${ad.id}`
        : 'http://localhost:3001/api/ads';
      
      const method = ad ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan iklan');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan saat menyimpan iklan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {ad ? 'Edit Iklan' : 'Iklan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Iklan *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nama untuk identifikasi iklan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipe *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="image">Gambar</option>
                <option value="script">Script HTML/JS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Posisi *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="header">Header Atas</option>
                <option value="sidebar">Sidebar</option>
                <option value="article">Tengah Artikel</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.type === 'image' ? 'URL Gambar *' : 'Script HTML/JS *'}
            </label>
            {formData.type === 'image' ? (
              <input
                type="url"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/banner.jpg"
              />
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="<script>...</script> atau <div>...</div>"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-coral-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-coral-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktif
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdsManagement;