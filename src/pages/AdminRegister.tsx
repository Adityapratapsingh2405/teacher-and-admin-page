import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudinaryUploadWidget from '../components/CloudinaryUploadWidget';
import './AdminRegister.css';

interface AdminRegisterForm {
  // Admin Details
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  designation: string;
  qualification: string;
  
  // School Details
  schoolName: string;
  schoolEmail: string;
  schoolWebsite: string;
  schoolContactNumber: string;
  schoolAddress: string;
  schoolLogo: string;
  schoolTagline: string;
}

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [step, setStep] = useState(1); // 1 for admin details, 2 for school details
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    // Check if user is logged in as developer
    const developerAuth = localStorage.getItem('developerAuth');
    if (developerAuth === 'true') {
      setIsDeveloperMode(true);
    }
  }, []);

  const [formData, setFormData] = useState<AdminRegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    designation: '',
    qualification: '',
    schoolName: '',
    schoolEmail: '',
    schoolWebsite: '',
    schoolContactNumber: '',
    schoolAddress: '',
    schoolLogo: '',
    schoolTagline: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      setError('Contact number must be 10 digits');
      return false;
    }
    if (!formData.designation.trim()) {
      setError('Designation is required');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.schoolName.trim()) {
      setError('School name is required');
      return false;
    }
    if (!formData.schoolEmail.trim()) {
      setError('School email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)) {
      setError('Invalid school email format');
      return false;
    }
    if (!formData.schoolContactNumber.trim()) {
      setError('School contact number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.schoolContactNumber)) {
      setError('School contact number must be 10 digits');
      return false;
    }
    if (!formData.schoolAddress.trim()) {
      setError('School address is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.contactNumber,
        designation: formData.designation,
        qualification: formData.qualification || '',
        schoolName: formData.schoolName,
        schoolEmail: formData.schoolEmail,
        schoolWebsite: formData.schoolWebsite || '',
        schoolContactNumber: formData.schoolContactNumber,
        schoolAddress: formData.schoolAddress,
        schoolLogo: formData.schoolLogo || '',
        schoolTagline: formData.schoolTagline || ''
      };

      // Use fetch directly to avoid axios interceptors that add auth headers
      const response = await fetch('https://3.110.94.0:8080/api/auth/register/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && (data.status === 200 || data.status === 201)) {
        setSuccess('Admin and school registered successfully!');
        setTimeout(() => {
          if (isDeveloperMode) {
            // Clear developer auth and redirect to login
            localStorage.removeItem('developerAuth');
            localStorage.removeItem('developerLoginTime');
            navigate('/admin/login');
          } else {
            navigate('/admin/login');
          }
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <div className="register-header">
          <h1>{isDeveloperMode ? 'School & Admin Registration' : 'Admin Registration'}</h1>
          <p>{isDeveloperMode ? 'Register a new school with admin account' : 'Register your school and admin account'}</p>
          {isDeveloperMode && (
            <div className="developer-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Developer Mode</span>
            </div>
          )}
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Admin Details</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">School Details</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Admin Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactNumber">
                    Contact Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="designation">
                    Designation <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="e.g., Principal, Director"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="qualification">
                  Qualification
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="Educational qualifications (optional)"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => isDeveloperMode ? navigate('/developer/register-school') : navigate('/admin/login')}
                >
                  <i className="fas fa-arrow-left"></i> {isDeveloperMode ? 'Cancel' : 'Back to Login'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>School Information</h2>
              
              <div className="form-group">
                <label htmlFor="schoolName">
                  School Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="schoolEmail">
                    School Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="schoolEmail"
                    name="schoolEmail"
                    value={formData.schoolEmail}
                    onChange={handleInputChange}
                    placeholder="school@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schoolWebsite">
                    School Website
                  </label>
                  <input
                    type="url"
                    id="schoolWebsite"
                    name="schoolWebsite"
                    value={formData.schoolWebsite}
                    onChange={handleInputChange}
                    placeholder="https://www.school.com (optional)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="schoolContactNumber">
                  School Contact Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="schoolContactNumber"
                  name="schoolContactNumber"
                  value={formData.schoolContactNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit contact number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="schoolAddress">
                  School Address <span className="required">*</span>
                </label>
                <textarea
                  id="schoolAddress"
                  name="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete school address"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="schoolLogo">
                  School Logo
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <CloudinaryUploadWidget
                    uwConfig={{
                      cloudName: 'dnmwonmud',
                      uploadPreset: 'ml_default',
                      multiple: false,
                      folder: 'slms_gallery',
                      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                      maxImageFileSize: 2000000, // 2MB
                      cropping: true,
                      showAdvancedOptions: false,
                      sources: ['local', 'camera'],
                      theme: 'minimal'
                    }}
                    onUploadSuccess={(results) => {
                      if (results && results.length > 0) {
                        setFormData(prev => ({
                          ...prev,
                          schoolLogo: results[0].secureUrl
                        }));
                        setSuccess('School logo uploaded successfully!');
                        setTimeout(() => setSuccess(''), 3000);
                      }
                    }}
                    onUploadError={(error) => {
                      setError('Failed to upload school logo. Please try again.');
                      console.error('Upload error:', error);
                    }}
                    buttonText={formData.schoolLogo ? 'Change Logo' : 'Upload Logo'}
                  />
                  {formData.schoolLogo && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: '#f0f9ff',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd'
                    }}>
                      <img 
                        src={formData.schoolLogo} 
                        alt="School logo preview" 
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1', fontWeight: 500 }}>
                          Logo uploaded ✓
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, schoolLogo: '' }))}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <small className="form-hint">Upload your school logo (optional)</small>
              </div>

              <div className="form-group">
                <label htmlFor="schoolTagline">
                  School Tagline
                </label>
                <input
                  type="text"
                  id="schoolTagline"
                  name="schoolTagline"
                  value={formData.schoolTagline}
                  onChange={handleInputChange}
                  placeholder="Enter school tagline or motto (optional)"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Registering...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Register
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="register-footer">
          {!isDeveloperMode && (
            <p>
              Already have an account?{' '}
              <span className="link" onClick={() => navigate('/admin/login')}>
                Login here
              </span>
            </p>
          )}
          {isDeveloperMode && (
            <p className="developer-note">
              <i className="fas fa-info-circle"></i>
              After registration, the admin can login at /admin/login
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
