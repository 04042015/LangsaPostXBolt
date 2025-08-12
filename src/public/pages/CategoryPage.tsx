import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticles(1);
    }
  }, [slug]);

  useEffect(() => {
    if (slug && currentPage > 1) {
      fetchArticles(currentPage);
    }
  }, [currentPage]);

  const fetchArticles = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/articles?category=${slug}&page=${page}&limit=12`);
      
      if (!response.ok) {
        setError('Terjadi kesalahan saat memuat artikel');
        return;
      }

      const data = await response.json();
      setArticles(data.articles);
      setPagination(data.pagination);
      
      // Set category name from first article
      if (data.articles.length > 0) {
        setCategoryName(data.articles[0].category_name);
      } else {
        // Fetch category name separately if no articles
        const categoriesResponse = await fetch('http://localhost:3001/api/categories');
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          const category = categories.find((c: any) => c.slug === slug);
          if (category) {
            setCategoryName(category.name);
          } else {
            setError('Kategori tidak ditemukan');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setError('Terjadi kesalahan saat memuat artikel');
    } finally {
      setIsLoading(false);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationNumbers = () => {
    if (!pagination) return [];
    
    const { page, totalPages } = pagination;
    const numbers = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }
    
    return numbers;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h1>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/" className="hover:text-coral-500">Beranda</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">{categoryName}</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {categoryName}
          </h1>
          
          {pagination && (
            <p className="text-gray-600 dark:text-gray-400">
              Menampilkan {articles.length} dari {pagination.total} artikel
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-coral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Sebelumnya
                </button>

                <div className="flex space-x-1">
                  {getPaginationNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-coral-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-coral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Belum ada artikel di kategori ini
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Silakan cek kembali nanti atau jelajahi kategori lain
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
    </div>
  );
};

export default CategoryPage;