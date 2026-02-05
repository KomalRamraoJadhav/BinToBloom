import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, XCircle, Clock, User, Edit, Package, Scale, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import { collectorAPI, trackingAPI } from '../utils/api';
import MapContainer from '../components/MapContainer';
import '../styles/collector-dashboard.css';

const CollectorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [allRequests, setAllRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    vehicleType: '',
    licenseNumber: ''
  });

  const [currentPos, setCurrentPos] = useState({ lat: 18.5204, lng: 73.8567 });
  const [showMap, setShowMap] = useState(false);
  const [mapTargetPickup, setMapTargetPickup] = useState(null);

  const [showBillForm, setShowBillForm] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [wasteWeight, setWasteWeight] = useState('');

  const wasteRates = {
    'ORGANIC_WASTE': 3,
    'RECYCLABLE_WASTE': 6,
    'E_WASTE': 20,
    'CHEMICAL_WASTE': 25,
    'HAZARDOUS_WASTE': 35,
    'CONSTRUCTION_WASTE': 2,
    'NON_RECYCLABLE_COMMERCIAL': 8,
    // Add default if needed
    'DEFAULT': 5
  };

  const getRateAndAmount = (weight, wasteType) => {
    const rate = wasteRates[wasteType] || wasteRates['DEFAULT'];
    const amount = (parseFloat(weight) || 0) * rate;
    return { rate, amount };
  };

  const [profileErrors, setProfileErrors] = useState({});

  // Profile validation functions
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'Name must be 2-50 characters, letters and spaces only';
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
      case 'vehicleType':
        if (value && value.length > 50) return 'Vehicle type must not exceed 50 characters';
        return '';
      case 'licenseNumber':
        if (value && value.length > 20) return 'License number must not exceed 20 characters';
        return '';
      default:
        return '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {
      name: validateProfileField('name', profile.name),
      phone: validateProfileField('phone', profile.phone),
      address: validateProfileField('address', profile.address),
      city: validateProfileField('city', profile.city),
      vehicleType: validateProfileField('vehicleType', profile.vehicleType),
      licenseNumber: validateProfileField('licenseNumber', profile.licenseNumber)
    };

    setProfileErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const [completionForm, setCompletionForm] = useState({
    weight: '',
    notes: ''
  });

  const tabs = [
    { id: 'requests', label: 'Available Requests', icon: <Package size={16} /> },
    { id: 'my-requests', label: 'My Pickups', icon: <Truck size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> }
  ];

  const fetchAllRequests = async () => {
    try {
      const response = await collectorAPI.getAllRequests();
      setAllRequests(response.data || []);
    } catch (error) {

      setAllRequests([]);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await collectorAPI.getMyRequests();
      setMyRequests(response.data || []);
    } catch (error) {

      setMyRequests([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await collectorAPI.getProfile();
      setProfile(response.data);
    } catch (error) {

      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        vehicleType: '',
        licenseNumber: ''
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAllRequests(),
          fetchMyRequests()
        ]);
        fetchProfile();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();

      // Start location tracking
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentPos(newPos);
          },
          (error) => console.error("Error watching position:", error),
          { enableHighAccuracy: true }
        );

        // Periodically send location to server if there are active requests
        const updateInterval = setInterval(() => {
          if (myRequests.some(r => ['ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'PAID'].includes(r.pickupStatus))) {
            collectorAPI.updateLocation({ latitude: currentPos.lat, longitude: currentPos.lng }).catch(e => console.error("Failed to update location"));
          }
        }, 10000); // Every 10 seconds

        return () => {
          navigator.geolocation.clearWatch(watchId);
          clearInterval(updateInterval);
        };
      }
    }
  }, [user, myRequests.length, currentPos.lat, currentPos.lng]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await collectorAPI.acceptRequest(requestId);
      toast.success('Request accepted successfully! 🚛');
      await Promise.all([fetchAllRequests(), fetchMyRequests()]);
    } catch (error) {

      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await collectorAPI.rejectRequest(requestId);
      toast.success('Request rejected');
      await fetchAllRequests();
    } catch (error) {

      toast.error('Failed to reject request');
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!billAmount || parseFloat(billAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await collectorAPI.generateBill(selectedRequest.pickupId, {
        amount: parseFloat(billAmount),
        weight: parseFloat(wasteWeight)
      });
      toast.success('Bill generated successfully! Waiting for user payment.');
      setShowBillForm(false);
      setSelectedRequest(null);
      setBillAmount('');
      setWasteWeight('');

      // Update locally
      setMyRequests(prev => prev.map(req =>
        req.pickupId === selectedRequest.pickupId
          ? { ...req, pickupStatus: 'PAYMENT_PENDING' }
          : req
      ));

      setTimeout(() => fetchMyRequests(), 500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate bill';
      toast.error(errorMessage);
    }
  };

  const handleCompleteRequest = async (e) => {
    e.preventDefault();
    if (!completionForm.weight || parseFloat(completionForm.weight) <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    try {
      const response = await collectorAPI.completeRequest(selectedRequest.pickupId, {
        weight: parseFloat(completionForm.weight),
        notes: completionForm.notes || ''
      });

      if (response.data) {
        toast.success(`Pickup completed! ${response.data.pointsAwarded || 0} points awarded to user 🌿`);
        setShowCompleteForm(false);
        setSelectedRequest(null);
        setCompletionForm({ weight: '', notes: '' });

        // Update the local state immediately
        setMyRequests(prev => prev.map(req =>
          req.pickupId === selectedRequest.pickupId
            ? { ...req, pickupStatus: 'COMPLETED' }
            : req
        ));

        // Refresh data from server
        setTimeout(() => {
          fetchMyRequests();
        }, 500);
      }
    } catch (error) {



      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to complete pickup. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await collectorAPI.updateProfile(profile);
      toast.success('Profile updated successfully! 🌿');
      setShowProfileForm(false);
      setProfileErrors({});
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const renderRequests = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Available Pickup Requests</h2>
      </div>

      <div className="requests-grid">
        {allRequests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No pending requests available
          </div>
        ) : (
          allRequests.map(request => (
            <div key={request.pickupId} className="request-card">
              <div className="request-header">
                <h3>{request.wasteType}</h3>
                <span className={`status status-${request.pickupStatus.toLowerCase()}`}>
                  {request.pickupStatus}
                </span>
              </div>
              <div className="request-details">
                <p><strong>User:</strong> {request.user?.name}</p>
                <p><strong>Address:</strong> {request.user?.address}</p>
                <p><strong>City:</strong> {request.user?.city}</p>
                <p><strong>Date:</strong> {request.scheduledDate}</p>
                <p><strong>Time:</strong> {request.scheduledTime}</p>
                {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
              </div>
              <div className="request-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleAcceptRequest(request.pickupId)}
                >
                  <CheckCircle size={16} />
                  Accept
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRejectRequest(request.pickupId)}
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMyRequests = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>My Assigned Pickups</h2>
      </div>

      <div className="requests-grid">
        {myRequests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No assigned pickups
          </div>
        ) : (
          myRequests.map(request => (
            <div key={request.pickupId} className="request-card">
              <div className="request-header">
                <h3>{request.wasteType}</h3>
                <span className={`status status-${request.pickupStatus.toLowerCase()}`}>
                  {request.pickupStatus}
                </span>
              </div>
              <div className="request-details">
                <p><strong>User:</strong> {request.user?.name}</p>
                <p><strong>Phone:</strong> {request.user?.phone}</p>
                <p><strong>Address:</strong> {request.user?.address}</p>
                <p><strong>City:</strong> {request.user?.city}</p>
                <p><strong>Date:</strong> {request.scheduledDate}</p>
                <p><strong>Time:</strong> {request.scheduledTime}</p>
                {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
              </div>
              <div className="request-actions">
                {request.pickupStatus === 'ASSIGNED' && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setMapTargetPickup(request);
                        setShowMap(true);
                      }}
                      style={{ marginRight: '0.5rem' }}
                    >
                      <MapPin size={16} />
                      View Map
                    </button>
                    {/* Only show Generate Bill for BUSINESS users, not HOUSEHOLD users */}
                    {request.user?.role === 'BUSINESS' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowBillForm(true);
                        }}
                      >
                        <CreditCard size={16} />
                        Generate Bill
                      </button>
                    )}
                    {/* For HOUSEHOLD users, show free pickup message */}
                    {request.user?.role === 'HOUSEHOLD' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowCompleteForm(true);
                        }}
                      >
                        <Scale size={16} />
                        Complete Free Pickup
                      </button>
                    )}
                  </>
                )}
                {(request.pickupStatus === 'PAID' || request.pickupStatus === 'IN_PROGRESS') && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowCompleteForm(true);
                    }}
                  >
                    <Scale size={16} />
                    Complete Pickup
                  </button>
                )}
                {/* Show payment pending only for BUSINESS users */}
                {request.pickupStatus === 'PAYMENT_PENDING' && request.user?.role === 'BUSINESS' && (
                  <span className="pending-badge" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                    ⏳ Waiting for Payment
                  </span>
                )}
                {request.pickupStatus === 'COMPLETED' && (
                  <span className="completed-badge">✅ Completed</span>
                )}
                {request.pickupStatus === 'PENDING' && (
                  <span className="pending-badge">⏳ Pending Assignment</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Collector Profile</h2>
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
            <Truck size={40} />
          </div>
          <div className="profile-details">
            <h3>{profile.name || 'N/A'}</h3>
            <p>{profile.email || 'N/A'}</p>
            <p>Role: Waste Collector</p>
            <p>Phone: {profile.phone || 'Not provided'}</p>
            <p>Address: {profile.address || 'Not provided'}</p>
            <p>City: {profile.city || 'Not provided'}</p>
            <p>Vehicle Type: {profile.vehicleType || 'Not provided'}</p>
            <p>License Number: {profile.licenseNumber || 'Not provided'}</p>
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
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'my-requests' && renderMyRequests()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {showMap && mapTargetPickup && (
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
          onClick={() => {
            setShowMap(false);
            setMapTargetPickup(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Pickup Location</h3>
              <button
                onClick={() => {
                  setShowMap(false);
                  setMapTargetPickup(null);
                }}
                className="btn-icon"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer
                center={{
                  lat: parseFloat(mapTargetPickup.latitude) || parseFloat(mapTargetPickup.pickupLocation?.lat) || currentPos.lat,
                  lng: parseFloat(mapTargetPickup.longitude) || parseFloat(mapTargetPickup.pickupLocation?.lng) || currentPos.lng
                }}
                markers={[
                  {
                    position: {
                      lat: parseFloat(mapTargetPickup.latitude) || parseFloat(mapTargetPickup.pickupLocation?.lat) || currentPos.lat,
                      lng: parseFloat(mapTargetPickup.longitude) || parseFloat(mapTargetPickup.pickupLocation?.lng) || currentPos.lng
                    },
                    label: "Pickup Point",
                    details: mapTargetPickup?.user?.address || "Customer Location"
                  },
                  {
                    position: currentPos,
                    label: "Collector",
                    details: "Your current location",
                    icon: "https://maps.google.com/mapfiles/ms/icons/truck.png"
                  }
                ]}
                trackingCollector={true}
                className="map-container-modal"
                style={{ height: '100%', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      {showBillForm && (
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
              setShowBillForm(false);
              setSelectedRequest(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Generate Bill</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Create a payment request for <strong>{selectedRequest?.user?.name}</strong>.
            </p>
            <form onSubmit={handleGenerateBill}>
              <div className="form-group">
                <label>Waste Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={wasteWeight}
                  onChange={(e) => {
                    const w = e.target.value;
                    setWasteWeight(w);
                    const { amount } = getRateAndAmount(w, selectedRequest?.wasteType);
                    setBillAmount(amount.toFixed(2));
                  }}
                  required
                  placeholder="Enter weight in kg"
                />
              </div>

              {wasteWeight && (
                <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>
                    <strong>Rate:</strong> ₹{getRateAndAmount(wasteWeight, selectedRequest?.wasteType).rate} / kg
                  </p>
                  <p style={{ margin: 0, fontSize: '1.25rem', color: '#15803d', fontWeight: 'bold' }}>
                    <strong>Total Bill:</strong> ₹{billAmount}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label>Total Amount (₹) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={billAmount}
                  readOnly
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillForm(false);
                    setSelectedRequest(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteForm && (
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
              setShowCompleteForm(false);
              setSelectedRequest(null);
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
            <h3>Complete Pickup</h3>
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <p><strong>User:</strong> {selectedRequest?.user?.name}</p>
              <p><strong>Waste Type:</strong> {selectedRequest?.wasteType}</p>
              <p><strong>Address:</strong> {selectedRequest?.user?.address}</p>
            </div>
            <form onSubmit={handleCompleteRequest}>
              <div className="form-group">
                <label>Weight Collected (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={completionForm.weight}
                  onChange={(e) => setCompletionForm({ ...completionForm, weight: e.target.value })}
                  required
                  placeholder="Enter weight in kg"
                />
              </div>
              <div className="form-group">
                <label>Collection Notes</label>
                <textarea
                  value={completionForm.notes}
                  onChange={(e) => setCompletionForm({ ...completionForm, notes: e.target.value })}
                  placeholder="Any observations or notes about the waste collected..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteForm(false);
                    setSelectedRequest(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Complete Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMap && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowMap(false);
            setMapTargetPickup(null);
          }}
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
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3>Pickup Location</h3>
            <p style={{ marginBottom: '1rem' }}>Destination: {mapTargetPickup?.user?.address}</p>
            <MapContainer
              center={mapTargetPickup?.latitude ? { lat: mapTargetPickup.latitude, lng: mapTargetPickup.longitude } : currentPos}
              markers={[
                {
                  position: { lat: mapTargetPickup.latitude, lng: mapTargetPickup.longitude },
                  label: "Pickup Point",
                  details: mapTargetPickup?.user?.address
                },
                {
                  position: currentPos,
                  label: "You",
                  details: "Your current location",
                  icon: "https://maps.google.com/mapfiles/ms/icons/truck.png"
                }
              ]}
              trackingCollector={false}
            />
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowMap(false)}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h3>Update Collector Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    if (profileErrors.name) setProfileErrors({ ...profileErrors, name: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, name: validateProfileField('name', e.target.value) })}
                  className={profileErrors.name ? 'error' : ''}
                  required
                />
                {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, phone: validateProfileField('phone', e.target.value) })}
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
                    setProfile({ ...profile, address: e.target.value });
                    if (profileErrors.address) setProfileErrors({ ...profileErrors, address: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, address: validateProfileField('address', e.target.value) })}
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
                    setProfile({ ...profile, city: e.target.value });
                    if (profileErrors.city) setProfileErrors({ ...profileErrors, city: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, city: validateProfileField('city', e.target.value) })}
                  className={profileErrors.city ? 'error' : ''}
                  required
                />
                {profileErrors.city && <span className="error-text">{profileErrors.city}</span>}
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select
                  value={profile.vehicleType}
                  onChange={(e) => {
                    setProfile({ ...profile, vehicleType: e.target.value });
                    if (profileErrors.vehicleType) setProfileErrors({ ...profileErrors, vehicleType: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, vehicleType: validateProfileField('vehicleType', e.target.value) })}
                  className={profileErrors.vehicleType ? 'error' : ''}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="BIKE">Bike</option>
                  <option value="AUTO">Auto Rickshaw</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                </select>
                {profileErrors.vehicleType && <span className="error-text">{profileErrors.vehicleType}</span>}
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  value={profile.licenseNumber}
                  onChange={(e) => {
                    setProfile({ ...profile, licenseNumber: e.target.value });
                    if (profileErrors.licenseNumber) setProfileErrors({ ...profileErrors, licenseNumber: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, licenseNumber: validateProfileField('licenseNumber', e.target.value) })}
                  className={profileErrors.licenseNumber ? 'error' : ''}
                  placeholder="Enter driving license number"
                />
                {profileErrors.licenseNumber && <span className="error-text">{profileErrors.licenseNumber}</span>}
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

export default CollectorDashboard;