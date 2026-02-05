import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { User, Mail, Lock, Phone, MapPin, Building, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/validation.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    role: 'HOUSEHOLD',
    businessType: '',
    licenseNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation patterns
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const addressRegex = /^[a-zA-Z0-9\s,.-]{10,200}$/;
  const cityRegex = /^[a-zA-Z\s]{2,50}$/;
  const businessTypeRegex = /^[a-zA-Z\s]{2,100}$/;

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return nameRegex.test(value) ? '' : 'Name must be 2-50 characters, letters and spaces only';
      case 'email':
        return emailRegex.test(value) ? '' : 'Email must be in format: user@example.com';
      case 'password':
        return passwordRegex.test(value) ? '' : 'Password must be 8+ characters with 1 uppercase, 1 number, 1 special character';
      case 'phone':
        return phoneRegex.test(value) ? '' : 'Phone must be exactly 10 digits';
      case 'address':
        return addressRegex.test(value) ? '' : 'Address must be 10-200 characters';
      case 'city':
        return cityRegex.test(value) ? '' : 'City must be 2-50 characters, letters and spaces only';
      case 'businessType':
        return formData.role === 'BUSINESS' && !businessTypeRegex.test(value) ? 'Business type must be 2-100 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      phone: validateField('phone', formData.phone),
      address: validateField('address', formData.address),
      city: validateField('city', formData.city),
      businessType: validateField('businessType', formData.businessType)
    };
    
    setErrors(newErrors);
    
    // Check if any errors exist
    if (Object.values(newErrors).some(error => error)) {
      toast.error('Please fix validation errors');
      return;
    }
    
    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        role: formData.role
      };

      // Add role-specific fields
      if (formData.role === 'BUSINESS') {
        registrationData.businessType = formData.businessType;
        registrationData.licenseNumber = formData.licenseNumber;
      }

      const response = await authAPI.register(registrationData);
      const { message } = response.data;
      
      toast.success(message || 'Registration successful! Please login to continue.');
      navigate('/login');
    } catch (error) {

      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🌿 Join BinToBloom</h2>
            <p>Create your account and start making a difference</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password (8+ chars, 1 upper, 1 number, 1 special)"
                value={formData.password}
                onChange={handleChange}
                required
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                required
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="HOUSEHOLD">🏠 Household User</option>
                <option value="BUSINESS">🏢 Business User</option>
                <option value="COLLECTOR">🚛 Waste Collector</option>
                <option value="NGO">🌍 NGO</option>
              </select>
            </div>

            {formData.role === 'BUSINESS' && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="businessType"
                    placeholder="Business Type (Restaurant, Hotel, Office, etc.)"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className={errors.businessType ? 'error' : ''}
                  />
                  {errors.businessType && <span className="error-text">{errors.businessType}</span>}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="License Number (Optional)"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : '🌿 Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
