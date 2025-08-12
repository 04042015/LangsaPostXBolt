import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Eye, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  views: number;
  published_at: string;
}

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/articles/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Artikel tidak ditemukan');
        } else {
          setError('Terjadi kesalahan saat memuat artikel');
        }
        return;
      }

      const articleData = await response.json();
      setArticle(articleData);

      // Fetch related articles
      const relatedResponse = await fetch(`http://localhost:3001/api/articles?category=${articleData.category_slug}&limit=4`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        // Filter out current article
        const filtered = relatedData.articles.filter((a: Article) => a.id !== articleData.id);
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Artikel tidak ditemukan'}
          </h1>
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
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to="/" className="hover:text-coral-500">Beranda</Link>
              <span>/</span>
              <Link to={`/kategori/${article.category_slug}`} className="hover:text-coral-500">
                {article.category_name}
              </Link>
              <span>/</span>
              <span className="text-gray-700 dark:text-gray-300">{article.title}</span>
            </nav>

            <div className="mb-4">
              <Link
                to={`/kategori/${article.category_slug}`}
                className="inline-block px-3 py-1 bg-coral-500 text-white text-sm font-medium rounded-md hover:bg-coral-600 transition-colors"
              >
                {article.category_name}
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <User size={16} className="mr-1" />
                  {article.author_name}
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {formatDate(article.published_at)}
                </span>
                <span className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  {formatViews(article.views)} views
                </span>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  <Share2 size={16} className="inline mr-1" />
                  Bagikan:
                </span>
                <button
                  onClick={shareOnFacebook}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={20} />
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-2 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={20} />
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-full transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-8">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/artikel/${relatedArticle.slug}`}>
                      <img
                        src={relatedArticle.featured_image || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg'}
                        alt={relatedArticle.title}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        <Link 
                          to={`/artikel/${relatedArticle.slug}`}
                          className="hover:text-coral-500 transition-colors"
                        >
                          {relatedArticle.title}
                        </Link>
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(relatedArticle.published_at)}</span>
                        <span className="flex items-center">
                          <Eye size={10} className="mr-1" />
                          {formatViews(relatedArticle.views)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
};

export default ArticlePage;