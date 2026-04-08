import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Badge } from '../UI/UI';
import './Navbar.css';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <button className="navbar__logo" onClick={() => onNavigate('home')}>
          <div className="navbar__logo-mark">
            <span>🌿</span>
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">Aahar</span>
            <span className="navbar__logo-suffix"> AI</span>
          </div>
        </button>

        {/* Desktop nav links */}
        {user && (
          <div className="navbar__links">
            {[
              { id: 'home',      label: 'Dashboard' },
              { id: 'generator', label: 'Diet Planner' },
            ].map((l) => (
              <button
                key={l.id}
                className={`navbar__link ${currentPage === l.id ? 'navbar__link--active' : ''}`}
                onClick={() => onNavigate(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="navbar__right">
          {user ? (
            <>
              <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="navbar__avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="navbar__user-info">
                  <span className="navbar__user-name">{user.name || 'User'}</span>
                  <Badge variant="saffron" size="sm">Active</Badge>
                </div>
                <span className="navbar__chevron">{menuOpen ? '▴' : '▾'}</span>
              </div>

              {menuOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user.name}</p>
                    <p className="navbar__dropdown-email">{user.email}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
