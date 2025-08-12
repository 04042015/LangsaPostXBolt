import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Eye, ArrowRight } from 'lucide-react';

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
  is_headline: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const HomePage: React.FC = () => {
  const [headlines, setHeadlines] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (headlines.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % headlines.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [headlines]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch headlines
      const headlinesResponse = await fetch('http://localhost:3001/api/articles?featured=true&limit=5');
      if (headlinesResponse.ok) {
        const headlinesData = await headlinesResponse.json();
        setHeadlines(headlinesData.articles);
      }

      // Fetch latest articles
      const latestResponse = await fetch('http://localhost:3001/api/articles?limit=6');
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        setLatestArticles(latestData.articles);
      }

      // Fetch popular articles
      const popularResponse = await fetch('http://localhost:3001/api/articles?sort=popular&limit=5');
      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        setPopularArticles(popularData.articles);
      }

      // Fetch categories
      const categoriesResponse = await fetch('http://localhost:3001/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      {headlines.length > 0 && (
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          {headlines.map((article, index) => (
            <div
              key={article.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${article.featured_image || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg'})`,
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50" />
                <div className="absolute inset-0 flex items-end">
                  <div className="container mx-auto px-4 pb-8">
                    <div className="max-w-2xl text-white">
                      <Link
                        to={`/kategori/${article.category_slug}`}
                        className="inline-block px-3 py-1 bg-coral-500 text-sm font-medium rounded-md mb-3 hover:bg-coral-600 transition-colors"
                      >
                        {article.category_name}
                      </Link>
                      <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                        <Link 
                          to={`/artikel/${article.slug}`}
                          className="hover:text-coral-300 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h1>
                      <p className="text-gray-200 mb-4 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
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
                          {formatViews(article.views)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {headlines.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-coral-500' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Berita Terbaru</h2>
                <Link
                  to="/cari"
                  className="flex items-center text-coral-500 hover:text-coral-600 font-medium"
                >
                  Lihat Semua
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestArticles.map((article) => (
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
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Articles */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Berita Populer</h3>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={article.id} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                        <Link 
                          to={`/artikel/${article.slug}`}
                          className="hover:text-coral-500 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Eye size={10} className="mr-1" />
                          {formatViews(article.views)}
                        </span>
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Categories */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Kategori Populer</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/kategori/${category.slug}`}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900 hover:text-coral-600 dark:hover:text-coral-400 transition-colors group"
                  >
                    <span className="text-sm font-medium truncate">{category.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;