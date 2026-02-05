import React, { useState, useEffect } from 'react';
import { Building, BarChart3, Download, MapPin, User, Edit, TrendingUp, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import { ngoAPI } from '../utils/api';
import '../styles/ngo-dashboard.css';

const NGODashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState({});
  const [cityAnalytics, setCityAnalytics] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    organizationName: '',
    registrationNumber: ''
  });

  const [profileErrors, setProfileErrors] = useState({});

  // Profile validation functions
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'Name must be 2-50 characters, letters and spaces only';
        return '';
      case 'organizationName':
        if (!value.trim()) return 'Organization name is required';
        if (value.length < 2 || value.length > 100) return 'Organization name must be 2-100 characters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length > 200) return 'Address must not exceed 200 characters';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'City must be 2-50 characters, letters and spaces only';
        return '';
      case 'registrationNumber':
        if (value && value.length > 50) return 'Registration number must not exceed 50 characters';
        return '';
      default:
        return '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {
      name: validateProfileField('name', profile.name),
      organizationName: validateProfileField('organizationName', profile.organizationName),
      phone: validateProfileField('phone', profile.phone),
      address: validateProfileField('address', profile.address),
      city: validateProfileField('city', profile.city),
      registrationNumber: validateProfileField('registrationNumber', profile.registrationNumber)
    };
    
    setProfileErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const tabs = [
    { id: 'analytics', label: 'City Analytics', icon: <BarChart3 size={16} /> },
    { id: 'reports', label: 'Reports', icon: <Download size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> }
  ];

  const fetchAnalytics = async () => {
    try {
      const response = await ngoAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {

      setAnalytics({});
    }
  };

  const fetchCityAnalytics = async (city) => {
    if (!city) return;
    try {
      const response = await ngoAPI.getCityAnalytics(city);
      setCityAnalytics(response.data);
    } catch (error) {

      setCityAnalytics({});
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await ngoAPI.getProfile();
      setProfile(response.data);
    } catch (error) {

      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        organizationName: '',
        registrationNumber: ''
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchAnalytics();
        fetchProfile();
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCity) {
      fetchCityAnalytics(selectedCity);
    }
  }, [selectedCity]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      toast.error('Please fix validation errors');
      return;
    }
    
    try {
      await ngoAPI.updateProfile(profile);
      toast.success('Profile updated successfully! 🌿');
      setShowProfileForm(false);
      setProfileErrors({});
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const downloadReport = () => {
    const reportData = {
      ...analytics,
      cityAnalytics: selectedCity ? cityAnalytics : null,
      generatedAt: new Date().toISOString()
    };
    
    const reportContent = `
NGO Environmental Impact Report
Organization: ${profile.organizationName}
Generated: ${new Date().toLocaleDateString()}

OVERALL STATISTICS:
- Total Waste Collected: ${analytics.totalWaste || 0} kg
- Total Pickups: ${analytics.totalPickups || 0}
- Completed Pickups: ${analytics.completedPickups || 0}

WASTE BY TYPE:
${Object.entries(analytics.wasteByType || {}).map(([type, weight]) => 
  `- ${type}: ${weight} kg`
).join('\n')}

CITY-WISE PICKUPS:
${Object.entries(analytics.cityWisePickups || {}).map(([city, count]) => 
  `- ${city}: ${count} pickups`
).join('\n')}

CITY-WISE WASTE:
${Object.entries(analytics.cityWiseWaste || {}).map(([city, weight]) => 
  `- ${city}: ${weight} kg`
).join('\n')}

${selectedCity ? `
DETAILED ANALYSIS FOR ${selectedCity.toUpperCase()}:
- Total Waste: ${cityAnalytics.totalWaste || 0} kg
- Total Pickups: ${cityAnalytics.totalPickups || 0}
- Waste by Type: ${Object.entries(cityAnalytics.wasteByType || {}).map(([type, weight]) => 
  `${type}: ${weight} kg`
).join(', ')}
` : ''}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-impact-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const renderAnalytics = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>City Analytics</h2>
        <div className="search-section">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search city..."
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-search-input"
            />
          </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <BarChart3 className="stat-icon" />
          <div className="stat-content">
            <h3>{analytics.totalWaste || 0} kg</h3>
            <p>Total Waste Collected</p>
          </div>
        </div>
        <div className="stat-card">
          <MapPin className="stat-icon" />
          <div className="stat-content">
            <h3>{analytics.totalPickups || 0}</h3>
            <p>Total Pickups</p>
          </div>
        </div>
        <div className="stat-card">
          <Building className="stat-icon" />
          <div className="stat-content">
            <h3>{Object.keys(analytics.cityWisePickups || {}).length}</h3>
            <p>Cities Covered</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>{analytics.completedPickups || 0}</h3>
            <p>Completed Pickups</p>
          </div>
        </div>
      </div>

      {selectedCity && cityAnalytics.city && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{cityAnalytics.city} - City Analysis</h3>
          <div className="city-stats-grid">
            <div className="city-stat-card">
              <h4>{cityAnalytics.totalWaste || 0} kg</h4>
              <p>Total Waste</p>
            </div>
            <div className="city-stat-card">
              <h4>{cityAnalytics.totalPickups || 0}</h4>
              <p>Total Pickups</p>
            </div>
          </div>
          <div className="waste-breakdown">
            <h4>Waste by Type:</h4>
            <div className="waste-types">
              {Object.entries(cityAnalytics.wasteByType || {}).map(([type, weight]) => (
                <div key={type} className="waste-type-item">
                  <span className="type-name">{type}</span>
                  <span className="type-weight">{weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <h3>All Cities Overview</h3>
          <div className="cities-list">
            {Object.entries(analytics.cityWiseWaste || {}).map(([city, weight]) => (
              <div 
                key={city} 
                className="city-overview-item"
                onClick={() => setSelectedCity(city)}
                style={{ cursor: 'pointer' }}
              >
                <span className="city-name">{city}</span>
                <span className="city-weight">{weight} kg</span>
              </div>
            ))}
            {Object.keys(analytics.cityWiseWaste || {}).length === 0 && (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Environmental Impact Reports</h2>
        <button className="btn btn-primary" onClick={downloadReport}>
          <Download size={16} />
          Download Report
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>Report Summary</h3>
          <div className="report-summary">
            <p><strong>Total Environmental Impact:</strong></p>
            <ul>
              <li>Waste Diverted from Landfills: {analytics.totalWaste || 0} kg</li>
              <li>CO₂ Emissions Saved: {((analytics.totalWaste || 0) * 0.5).toFixed(1)} kg</li>
              <li>Communities Served: {Object.keys(analytics.cityWisePickups || {}).length}</li>
              <li>Active Partnerships: {analytics.completedPickups || 0}</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h3>Campaign Insights</h3>
          <div className="campaign-insights">
            <p>High-impact areas for awareness campaigns:</p>
            <ul>
              {Object.entries(analytics.cityWiseWaste || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([city, weight]) => (
                  <li key={city}>{city} - {weight} kg collected</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>NGO Profile</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            fetchProfile();
            setShowProfileForm(true);
          }}
        >
          <Edit size={16} />
          Update Profile
        </button>
      </div>
      
      <div className="profile-info">
        <div className="profile-card">
          <div className="profile-avatar">
            <Building size={40} />
          </div>
          <div className="profile-details">
            <h3>{profile.organizationName || 'N/A'}</h3>
            <p>{profile.name || 'N/A'}</p>
            <p>{profile.email || 'N/A'}</p>
            <p>Registration: {profile.registrationNumber || 'Not provided'}</p>
            <p>Phone: {profile.phone || 'Not provided'}</p>
            <p>Address: {profile.address || 'Not provided'}</p>
            <p>City: {profile.city || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="dashboard">
        <DashboardNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabs={tabs}
        />
        
        <div className="dashboard-content">
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {showProfileForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfileForm(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Update NGO Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({...profile, name: e.target.value});
                    if (profileErrors.name) setProfileErrors({...profileErrors, name: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, name: validateProfileField('name', e.target.value)})}
                  className={profileErrors.name ? 'error' : ''}
                  required
                />
                {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  value={profile.organizationName}
                  onChange={(e) => {
                    setProfile({...profile, organizationName: e.target.value});
                    if (profileErrors.organizationName) setProfileErrors({...profileErrors, organizationName: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, organizationName: validateProfileField('organizationName', e.target.value)})}
                  className={profileErrors.organizationName ? 'error' : ''}
                  required
                />
                {profileErrors.organizationName && <span className="error-text">{profileErrors.organizationName}</span>}
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => {
                    setProfile({...profile, registrationNumber: e.target.value});
                    if (profileErrors.registrationNumber) setProfileErrors({...profileErrors, registrationNumber: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, registrationNumber: validateProfileField('registrationNumber', e.target.value)})}
                  className={profileErrors.registrationNumber ? 'error' : ''}
                />
                {profileErrors.registrationNumber && <span className="error-text">{profileErrors.registrationNumber}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({...profile, phone: e.target.value});
                    if (profileErrors.phone) setProfileErrors({...profileErrors, phone: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, phone: validateProfileField('phone', e.target.value)})}
                  className={profileErrors.phone ? 'error' : ''}
                  required
                />
                {profileErrors.phone && <span className="error-text">{profileErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => {
                    setProfile({...profile, address: e.target.value});
                    if (profileErrors.address) setProfileErrors({...profileErrors, address: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, address: validateProfileField('address', e.target.value)})}
                  className={profileErrors.address ? 'error' : ''}
                  required
                  rows="3"
                />
                {profileErrors.address && <span className="error-text">{profileErrors.address}</span>}
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => {
                    setProfile({...profile, city: e.target.value});
                    if (profileErrors.city) setProfileErrors({...profileErrors, city: ''});
                  }}
                  onBlur={(e) => setProfileErrors({...profileErrors, city: validateProfileField('city', e.target.value)})}
                  className={profileErrors.city ? 'error' : ''}
                  required
                />
                {profileErrors.city && <span className="error-text">{profileErrors.city}</span>}
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowProfileForm(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NGODashboard;