import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, User, Eye } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  views: number;
  published_at: string;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/articles?search=${encodeURIComponent(query)}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Cari Berita
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan kata kunci pencarian..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-coral-500 text-white rounded-r-lg hover:bg-coral-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
          </div>
        ) : hasSearched ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {articles.length > 0 
                  ? `Ditemukan ${articles.length} artikel untuk "${searchParams.get('q')}"`
                  : `Tidak ada hasil untuk "${searchParams.get('q')}"`
                }
              </h2>
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/artikel/${article.slug}`}>
                      <img
                        src={article.featured_image || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg'}
                        alt={article.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>
                    <div className="p-4">
                      <Link
                        to={`/kategori/${article.category_slug}`}
                        className="inline-block px-2 py-1 bg-coral-100 text-coral-600 text-xs font-medium rounded mb-2 hover:bg-coral-200 transition-colors"
                      >
                        {article.category_name}
                      </Link>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        <Link 
                          to={`/artikel/${article.slug}`}
                          className="hover:text-coral-500 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <User size={12} className="mr-1" />
                          {article.author_name}
                        </span>
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(article.published_at)}
                        </span>
                        <span className="flex items-center">
                          <Eye size={12} className="mr-1" />
                          {formatViews(article.views)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tidak ada hasil ditemukan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Coba gunakan kata kunci yang berbeda atau lebih umum
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-colors"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Masukkan kata kunci untuk mencari berita
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Temukan berita terkini dengan menggunakan fitur pencarian di atas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;