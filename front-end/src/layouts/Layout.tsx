import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, User, LogIn, UserPlus, Home as HomeIcon, Bookmark } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
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
        <div className="container nav-container">
          <Link to="/" className="flex items-center gap-3 text-primary font-black text-2xl tracking-tighter">
            <Calendar size={32} strokeWidth={3} />
            MEETING ROOM
          </Link>
          
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/" className={`nav-link flex items-center gap-2 ${isActive('/') ? 'active' : ''}`}>
                  <HomeIcon size={18} />
                  BROWSE ROOMS
                </Link>
                <Link to="/my-bookings" className={`nav-link flex items-center gap-2 ${isActive('/my-bookings') ? 'active' : ''}`}>
                  <Bookmark size={18} />
                  MY BOOKINGS
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className={`nav-link flex items-center gap-2 ${isActive('/admin') ? 'active' : ''}`}>
                    <LayoutDashboard size={18} />
                    ADMIN PANEL
                  </Link>
                )}
                <div className="flex items-center gap-6 ml-6 pl-6 border-l-2 border-border">
                  <div className="flex items-center gap-3 text-xs font-black text-muted uppercase">
                    <User size={18} className="text-primary" />
                    <span className="text-white">{user.username}</span>
                    <span className="badge badge-pending">
                      {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-outline p-2 border-border" title="Logout">
                    <LogOut size={20} color="white" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline px-6">
                  LOGIN
                </Link>
                <Link to="/signup" className="btn btn-primary px-6">
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="container py-12 flex-1">
        {children}
      </main>
      
      <footer className="py-8 border-t-2 border-border bg-surface mt-auto">
        <div className="container text-center text-muted font-bold text-[10px] uppercase tracking-[0.2em]">
          &copy; 2026 Meeting Room System &bull; Operations Secured
        </div>
      </footer>
    </div>
  );
};

export default Layout;
