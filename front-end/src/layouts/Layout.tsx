import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Calendar, LayoutDashboard, User, LogIn, UserPlus, Home as HomeIcon, Bookmark, Moon, Sun } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="navbar">
        <div className="nav-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Link to="/" className="flex items-center gap-3 text-primary font-black text-2xl tracking-tighter whitespace-nowrap">
            <Calendar size={32} strokeWidth={3} />
            MEETING ROOM
          </Link>
          
          <div className="nav-links justify-end">
            {user ? (
              <>
                <Link to="/" className={`nav-link flex items-center gap-2 ${isActive('/') ? 'active' : ''}`}>
                  <HomeIcon size={18} />
                  BROWSE
                </Link>
                <Link to="/my-bookings" className={`nav-link flex items-center gap-2 ${isActive('/my-bookings') ? 'active' : ''}`}>
                  <Bookmark size={18} />
                  MY BOOKINGS
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className={`nav-link flex items-center gap-2 ${isActive('/admin') ? 'active' : ''}`}>
                    <LayoutDashboard size={18} />
                    ADMIN
                  </Link>
                )}
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', marginLeft: '1.5rem' }} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase">
                    <User size={16} className="text-primary" />
                    <span className="text-foreground">{user.username}</span>
                    <span className="badge badge-pending">
                      {user.role}
                    </span>
                  </div>
                  <button 
                    onClick={toggleTheme} 
                    className="btn btn-outline p-2 rounded-lg" 
                    title="Toggle Theme"
                    style={{ minWidth: 'auto', padding: '0.6rem' }}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                  <button onClick={handleLogout} className="btn btn-outline p-2 rounded-lg" title="Logout" style={{ minWidth: 'auto', padding: '0.6rem' }}>
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={toggleTheme} 
                  className="btn btn-outline p-2 rounded-lg" 
                  title="Toggle Theme"
                  style={{ minWidth: 'auto', padding: '0.6rem' }}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <Link to="/login" className="btn btn-outline px-6 rounded-lg">
                  LOGIN
                </Link>
                <Link to="/signup" className="btn btn-primary px-6 rounded-lg">
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="container py-12 flex-1" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
      
      <footer className="border-t border-border bg-surface mt-auto">
        <div className="container text-center text-muted font-semibold text-xs uppercase tracking-wider" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem' }}>
          &copy; 2026 Meeting Room System &bull; Designed for Excellence
        </div>
      </footer>
    </div>
  );
};

export default Layout;
