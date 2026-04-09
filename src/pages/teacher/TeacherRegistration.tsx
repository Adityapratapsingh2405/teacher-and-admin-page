import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherRegistration.css';
import AuthService, { StaffRegistrationData } from '../../services/authService';

interface TeacherFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  qualification: string;
  designation: string;
  joiningDate: string;
  salaryGrade: string;
}

interface TeacherRegistrationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  contactNumber?: string;
  qualification?: string;
  designation?: string;
  joiningDate?: string;
  salaryGrade?: string;
  general?: string;
}

const TeacherRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    qualification: '',
    designation: '',
    joiningDate: '',
    salaryGrade: ''
  });
  const [errors, setErrors] = useState<TeacherRegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof TeacherRegistrationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TeacherRegistrationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

    // Contact number validation
    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    // Qualification validation
    if (!formData.qualification) {
      newErrors.qualification = 'Education qualification is required';
    }

    // Designation validation
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    // Joining date validation
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    } else {
      const joiningDate = new Date(formData.joiningDate);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      if (joiningDate < oneYearAgo || joiningDate > oneYearFromNow) {
        newErrors.joiningDate = 'Joining date must be within the last year or next year';
      }
    }

    // Salary grade validation
    if (!formData.salaryGrade) {
      newErrors.salaryGrade = 'Salary grade is required';
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
      // Prepare registration data matching backend StaffRegistrationDto
      const registrationData: StaffRegistrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNumber: formData.contactNumber,
        qualification: formData.qualification,
        designation: formData.designation,
        joiningDate: formData.joiningDate, // Format: YYYY-MM-DD
        salaryGrade: formData.salaryGrade,
        roles: ['ROLE_TEACHER'] // Teacher role
      };

      // Call backend API to register teacher
      await AuthService.registerStaff(registrationData);
      
      // Show success message and redirect to login
      alert('Registration successful! Your teacher account has been created. Please login with your email and password.');
      navigate('/teacher');
    } catch (error: any) {
      console.error('Teacher registration error:', error);
      
      // Handle specific error messages
      if (error.message.includes('Email already registered') || error.message.toLowerCase().includes('already exists')) {
        setErrors({ email: 'This email is already registered. Please use a different email or login.' });
      } else if (error.message.includes('Invalid email') || error.message.toLowerCase().includes('email')) {
        setErrors({ email: 'Invalid email address. Please check and try again.' });
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
    <div className="teacher-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Teacher Registration</h1>
          <p>Create your teacher account</p>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
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
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                  required
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
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number *</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter 10-digit contact number"
                className={errors.contactNumber ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="form-section">
            <h3 className="section-title">Professional Information</h3>
            
            <div className="form-group">
              <label htmlFor="qualification">Education Qualification *</label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="e.g., M.Ed., B.Ed., PhD in Mathematics"
                className={errors.qualification ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.qualification && <span className="error-message">{errors.qualification}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g., Senior Teacher, Assistant Professor"
                className={errors.designation ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="joiningDate">Joining Date *</label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className={errors.joiningDate ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.joiningDate && <span className="error-message">{errors.joiningDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="salaryGrade">Salary Grade *</label>
                <select
                  id="salaryGrade"
                  name="salaryGrade"
                  value={formData.salaryGrade}
                  onChange={handleInputChange}
                  className={errors.salaryGrade ? 'error' : ''}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Salary Grade</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                </select>
                {errors.salaryGrade && <span className="error-message">{errors.salaryGrade}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <span onClick={() => navigate('/teacher')}>Login here</span></p>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegistration;
