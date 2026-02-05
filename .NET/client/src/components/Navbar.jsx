import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Leaf, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <Leaf className="nav-icon" />
          <span className="nav-brand">BinToBloom</span>
        </Link>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className={`nav-menu ${isMobileMenuOpen ? 'nav-menu-open' : ''}`}>
          <div className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''}`}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
          </div>
          
          {user ? (
            <div className="nav-user">
              <Link 
                to="/dashboard" 
                className={`nav-link dashboard-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <div className="user-info">
                <span className="nav-username">{user.name}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link nav-register ${isActive('/register') ? 'nav-link-active' : ''}`}
                onClick={closeMobileMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;