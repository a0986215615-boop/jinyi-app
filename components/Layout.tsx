import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Calendar, User, Menu, X, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, settings } = useAuth();

  const navItems = [
    { path: '/', label: '首頁', icon: <Activity size={18} /> },
    { path: '/check', label: '症狀導診', icon: <Activity size={18} /> },
    { path: '/book', label: '線上掛號', icon: <Calendar size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Activity className="h-8 w-8" />
                <span>{settings.appName}</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'bg-accent text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
                    }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center ml-4 space-x-2 border-l pl-4 border-slate-200">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/admin')
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                        }`}
                    >
                      <ShieldCheck size={18} className="mr-2" />
                      <span>管理後台</span>
                    </Link>
                  )}

                  <Link
                    to="/my-appointments"
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/my-appointments')
                      ? 'bg-accent text-primary'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <User size={18} className="mr-2" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="登出"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center ml-4 border-l pl-4 border-slate-200">
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-bold text-primary hover:bg-accent transition-colors"
                  >
                    <LogIn size={18} className="mr-2" />
                    登入 / 註冊
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-primary focus:outline-none p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive(item.path)
                  ? 'bg-accent text-primary'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="border-t border-slate-100 my-2 pt-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-3 rounded-md text-base font-medium flex items-center text-slate-800 bg-slate-100 mb-2"
                    >
                      <ShieldCheck size={18} className="mr-3" />
                      管理後台
                    </Link>
                  )}
                  <Link
                    to="/my-appointments"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive('/my-appointments') ? 'bg-accent text-primary' : 'text-slate-600'
                      }`}
                  >
                    <User size={18} className="mr-3" />
                    {user.name} 的預約
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 rounded-md text-base font-medium flex items-center text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={18} className="mr-3" />
                    登出
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium flex items-center text-primary hover:bg-accent"
                >
                  <LogIn size={18} className="mr-3" />
                  登入 / 註冊
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2 text-slate-200 font-semibold">{settings.appName}系統</p>
          <p className="text-sm mb-4">提供最專業、最便捷的醫療預約服務</p>
          <p className="text-xs text-slate-500">&copy; 2024 {settings.appName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};