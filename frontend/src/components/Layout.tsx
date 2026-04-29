import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LayoutDashboard, LogOut, User, Settings } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tight">
                ResumeIQ
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200/50">
                <div className="bg-white p-1 rounded-full shadow-sm">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</span>
              </div>
              
              <button 
                onClick={logout} 
                className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ResumeIQ. Designed & Developed by <span className="font-semibold text-gray-700">Jayavignesh</span>.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="https://jayavignesh.dev" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">jayavignesh.dev</a>
            <span className="text-gray-300">|</span>
            <a href="https://linkedin.com/in/jayavigneshj" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
