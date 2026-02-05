import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DashboardNavbar = ({ activeTab, setActiveTab, tabs }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      'HOUSEHOLD': 'Household',
      'BUSINESS': 'Business',
      'COLLECTOR': 'Collector',
      'NGO': 'NGO',
      'ADMIN': 'Admin'
    };
    return roleMap[role] || role;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-nav-content">
        <div className="dashboard-logo">
          <span>BinToBloom Dashboard</span>
        </div>
        
        <div className="dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="dashboard-user" ref={dropdownRef}>
          <button 
            className="user-info-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="User menu"
          >
            <User size={20} />
            <span className="user-name">{user?.name}</span>
            <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-item dropdown-role">
                <span className="dropdown-label">Role:</span>
                <span className="dropdown-value">{getRoleLabel(user?.role)}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;