import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentRegistration.css';
import AuthService, { StudentRegistrationData } from '../../services/authService';
import { DropdownService, ClassInfoResponse, SessionOption } from '../../services/dropdownService';
import CloudinaryUploadWidget from '../../components/CloudinaryUploadWidget';

interface StudentFormData {
  panNumber: string;
  name: string;
  password: string;
  confirmPassword: string;
  classId: string;
  sessionId: string;
  mobileNumber: string;
  parentName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  previousSchool: string;
  photo: File | null;
}

interface StudentRegistrationErrors {
  panNumber?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  classId?: string;
  sessionId?: string;
  mobileNumber?: string;
  parentName?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  photo?: string;
  general?: string;
}

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentFormData>({
    panNumber: '',
    name: '',
    password: '',
    confirmPassword: '',
    classId: '',
    sessionId: '',
    mobileNumber: '',
    parentName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    previousSchool: '',
    photo: null
  });
  
  const [errors, setErrors] = useState<StudentRegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassInfoResponse[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState('');

  // Fetch classes and sessions on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      setDropdownError('');
      
      try {
        const [classesData, sessionsData] = await Promise.all([
          DropdownService.getAllClasses(),
          DropdownService.getAllSessions()
        ]);
        
        setClasses(classesData);
        setSessions(sessionsData);
        
        // Auto-select active session if available
        const activeSession = sessionsData.find(s => s.isActive);
        if (activeSession) {
          setFormData(prev => ({ ...prev, sessionId: activeSession.id.toString() }));
        }
        
        if (classesData.length === 0) {
          setDropdownError('No classes available. Please contact administrator.');
        }
        if (sessionsData.length === 0) {
          setDropdownError('No active session found. Please contact administrator.');
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
        setDropdownError('Failed to load classes and sessions. Please refresh the page.');
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof StudentRegistrationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: StudentRegistrationErrors = {};

    // PEN Number validation
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PEN Number is required';
    } else if (formData.panNumber.length < 4) {
      newErrors.panNumber = 'PEN Number must be at least 4 characters';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Class validation
    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    // Session validation
    if (!formData.sessionId) {
      newErrors.sessionId = 'Session is required';
    }

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    // Parent name validation
    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 3 || age > 25) {
        newErrors.dateOfBirth = 'Age must be between 3 and 25 years';
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Emergency contact validation
    if (!formData.emergencyContact) {
      newErrors.emergencyContact = 'Emergency contact is required';
    } else if (!/^\d{10}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    }

    // Blood group validation
    // if (!formData.bloodGroup) {
    //   newErrors.bloodGroup = 'Blood group is required';
    // }

    // Photo validation (optional but recommended)
    if (!formData.photo) {
      newErrors.photo = 'Recent photo is recommended (optional)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Use Cloudinary URL if already uploaded, otherwise photo is optional
      const photoUrl = uploadedPhotoUrl || undefined;

      // Prepare registration data matching backend StudentRequestDto
      const registrationData: StudentRegistrationData = {
        panNumber: formData.panNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth, // Format: YYYY-MM-DD
        gender: formData.gender, // MALE, FEMALE, OTHER
        bloodGroup: formData.bloodGroup,
        parentName: formData.parentName.trim(),
        emergencyContact: formData.emergencyContact,
        previousSchool: formData.previousSchool.trim() || undefined,
        classId: parseInt(formData.classId),
        sessionId: parseInt(formData.sessionId),
        photo: photoUrl
      };

      // Call backend API to register student
      await AuthService.registerStudent(registrationData);
      
      // Show success message and redirect to login
      alert('Registration successful! Your account has been created. Please login with your PEN number and password.');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      if (error.message.includes('PEN already registered') || error.message.toLowerCase().includes('already exists')) {
        setErrors({ panNumber: 'This PEN number is already registered. Please use a different PEN or login.' });
      } else if (error.message.includes('Class not found') || error.message.toLowerCase().includes('invalid class')) {
        setErrors({ classId: 'Selected class is not available. Please choose another class.' });
      } else if (error.message.includes('Session not found') || error.message.toLowerCase().includes('invalid session')) {
        setErrors({ sessionId: 'Selected session is not available. Please choose another session.' });
      } else if (error.message.includes('Network Error') || error.message.toLowerCase().includes('network')) {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ general: error.message || 'Registration failed. Please try again or contact administrator.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="student-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Student Registration</h1>
          <p>Create your student account</p>
        </div>

        {dropdownError && (
          <div className="alert alert-warning">
            {dropdownError}
          </div>
        )}

        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information */}
          <h3 className="form-section-title">Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="panNumber">PEN Number *</label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              placeholder="Enter your PEN number (e.g., PEN001)"
              disabled={isLoading}
              className={errors.panNumber ? 'error' : ''}
            />
            {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
            <small>Your unique identification number</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              disabled={isLoading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (min 6 characters)"
                disabled={isLoading}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                disabled={isLoading}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.dateOfBirth ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group (Optional)</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.bloodGroup ? 'error' : ''}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodGroup && <span className="error-message">{errors.bloodGroup}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="photo">Recent Photo</label>
              <CloudinaryUploadWidget
                uwConfig={{
                  cloudName: 'dnmwonmud',
                  uploadPreset: 'ml_default',
                  multiple: false,
                  folder: 'slms-students',
                  cropping: true,
                  showAdvancedOptions: false,
                  sources: ['local', 'camera'],
                  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                  maxImageFileSize: 2097152, // 2MB
                  maxFiles: 1,
                  theme: 'default'
                }}
                onUploadSuccess={(results) => {
                  if (results && results.length > 0) {
                    const url = results[0].secureUrl;
                    setUploadedPhotoUrl(url);
                    setFormData(prev => ({ ...prev, photo: null }));
                    setErrors(prev => ({ ...prev, photo: '' }));
                    console.log('Student photo uploaded to Cloudinary:', url);
                  }
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                  setErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }));
                }}
                buttonText={uploadedPhotoUrl ? '✓ Photo Uploaded - Upload Another' : 'Upload Photo (Optional)'}
                disabled={isLoading}
              />
              {uploadedPhotoUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img 
                    src={uploadedPhotoUrl} 
                    alt="Uploaded" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #10b981'
                    }} 
                  />
                  <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    ✓ Photo uploaded successfully
                  </p>
                </div>
              )}
              {errors.photo && <span className="error-message">{errors.photo}</span>}
              <small>Upload passport-size photo (JPG/PNG, max 2MB) - Optional</small>
            </div>
          </div>

          {/* Academic Information */}
          <h3 className="form-section-title">Academic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="classId">Class *</label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                disabled={isLoading || loadingDropdowns}
                className={errors.classId ? 'error' : ''}
              >
                <option value="">
                  {loadingDropdowns ? 'Loading classes...' : 'Select Class'}
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className}
                  </option>
                ))}
              </select>
              {errors.classId && <span className="error-message">{errors.classId}</span>}
              {classes.length === 0 && !loadingDropdowns && (
                <small className="text-warning">No classes available</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sessionId">Session *</label>
              <select
                id="sessionId"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleInputChange}
                disabled={isLoading || loadingDropdowns}
                className={errors.sessionId ? 'error' : ''}
              >
                <option value="">
                  {loadingDropdowns ? 'Loading sessions...' : 'Select Session'}
                </option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.sessionName} {session.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
              {errors.sessionId && <span className="error-message">{errors.sessionId}</span>}
              {sessions.length === 0 && !loadingDropdowns && (
                <small className="text-warning">No sessions available</small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="previousSchool">Previous School</label>
            <input
              type="text"
              id="previousSchool"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleInputChange}
              placeholder="Enter previous school name (if any)"
              disabled={isLoading}
            />
            <small>Optional - Leave blank if this is your first school</small>
          </div>

          {/* Contact Information */}
          <h3 className="form-section-title">Contact Information</h3>

          <div className="form-group">
            <label htmlFor="address">Residential Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete residential address"
              disabled={isLoading}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number *</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                disabled={isLoading}
                className={errors.mobileNumber ? 'error' : ''}
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact *</label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Enter 10-digit emergency contact"
                disabled={isLoading}
                className={errors.emergencyContact ? 'error' : ''}
              />
              {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="parentName">Parent/Guardian Name *</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              placeholder="Enter parent or guardian name"
              disabled={isLoading}
              className={errors.parentName ? 'error' : ''}
            />
            {errors.parentName && <span className="error-message">{errors.parentName}</span>}
          </div>

          <button 
            type="submit" 
            className="register-btn" 
            disabled={isLoading || loadingDropdowns || classes.length === 0 || sessions.length === 0}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <span onClick={() => navigate('/')}>Login here</span></p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
