import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { AuthProvider } from './shared/contexts/AuthContext';
import PublicLayout from './public/components/Layout/PublicLayout';
import AdminLayout from './admin/components/Layout/AdminLayout';
import HomePage from './public/pages/HomePage';
import ArticlePage from './public/pages/ArticlePage';
import CategoryPage from './public/pages/CategoryPage';
import SearchPage from './public/pages/SearchPage';
import AboutPage from './public/pages/AboutPage';
import ContactPage from './public/pages/ContactPage';
import LoginPage from './admin/pages/LoginPage';
import Dashboard from './admin/pages/Dashboard';
import ArticlesManagement from './admin/pages/ArticlesManagement';
import UsersManagement from './admin/pages/UsersManagement';
import PayrollManagement from './admin/pages/PayrollManagement';
import AdsManagement from './admin/pages/AdsManagement';
import MediaLibrary from './admin/pages/MediaLibrary';
import Settings from './admin/pages/Settings';
import ProtectedRoute from './shared/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="artikel/:slug" element={<ArticlePage />} />
              <Route path="kategori/:slug" element={<CategoryPage />} />
              <Route path="cari" element={<SearchPage />} />
              <Route path="tentang" element={<AboutPage />} />
              <Route path="kontak" element={<ContactPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="artikel" element={<ArticlesManagement />} />
              <Route path="pengguna" element={<UsersManagement />} />
              <Route path="gaji" element={<PayrollManagement />} />
              <Route path="iklan" element={<AdsManagement />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="pengaturan" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;