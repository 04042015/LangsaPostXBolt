import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Monitor,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', exact: true },
    { icon: FileText, label: 'Artikel', path: '/admin/artikel' },
    { icon: Users, label: 'Pengguna', path: '/admin/pengguna', roles: ['admin'] },
    { icon: DollarSign, label: 'Gaji', path: '/admin/gaji' },
    { icon: Monitor, label: 'Iklan', path: '/admin/iklan', roles: ['admin', 'editor'] },
    { icon: Image, label: 'Media', path: '/admin/media' },
    { icon: Settings, label: 'Pengaturan', path: '/admin/pengaturan', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const isActivePath = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-coral-500">LangsaPost Admin</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActivePath(item.path, item.exact);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-coral-100 dark:bg-coral-900 text-coral-600 dark:text-coral-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <IconComponent size={20} className="mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                target="_blank"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-coral-500"
              >
                Lihat Situs
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;