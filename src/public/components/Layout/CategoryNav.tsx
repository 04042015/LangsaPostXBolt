import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 overflow-x-auto">
      <div className="container mx-auto px-4">
        <div className="flex space-x-6 py-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className="text-gray-300 hover:text-white whitespace-nowrap py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-700"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;