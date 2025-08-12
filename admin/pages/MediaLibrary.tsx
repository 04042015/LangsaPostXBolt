import React, { useState, useEffect } from 'react';
import { Upload, Image, Trash2, Search, Filter } from 'lucide-react';

interface MediaFile {
  id: number;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploaded_by_name: string;
  created_at: string;
}

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/media/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchMediaFiles();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload file');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${filename}?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMediaFiles(mediaFiles.filter(file => file.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan saat menghapus file');
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = `http://localhost:3001${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert('URL berhasil disalin ke clipboard');
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || file.type.startsWith(typeFilter);
    
    return matchesSearch && matchesType;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Upload size={20} className="mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Gambar'}
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Semua Tipe</option>
            <option value="image">Gambar</option>
          </select>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter size={16} className="mr-2" />
            {filteredFiles.length} dari {mediaFiles.length} file
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
            <div className="aspect-square relative">
              {file.type.startsWith('image/') ? (
                <img
                  src={`http://localhost:3001${file.url}`}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.filename)}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.filename}>
                {file.filename}
              </p>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{formatFileSize(file.size)}</p>
                <p>oleh {file.uploaded_by_name}</p>
                <p>{formatDate(file.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tidak ada file yang sesuai dengan pencarian' : 'Belum ada file media'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Upload gambar pertama Anda dengan tombol "Upload Gambar" di atas
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;