import React, { useState } from 'react';
import './StudentLogin.css';
import AuthService from '../../services/authService';

interface StudentLoginProps {
  onLogin: () => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin }) => {
  const [panNumber, setPanNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend API to login student
      const response = await AuthService.loginStudent({
        panNumber: panNumber.trim(),
        password
      });

      // Store additional student information
      localStorage.setItem('panNumber', panNumber.trim());
      localStorage.setItem('userType', 'student');
      localStorage.setItem('userRole', 'ROLE_STUDENT');

      // Calculate and store token expiration timestamps
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expirationTime = currentTimestamp + response.expiresIn;
      localStorage.setItem('tokenIssuedAt', currentTimestamp.toString());
      localStorage.setItem('tokenExpiresAt', expirationTime.toString());

      // Call parent component's onLogin to redirect to dashboard
      onLogin();
    } catch (error: any) {
      console.error('Student login error:', error);
      
      // Handle different error types
      if (error.message) {
        // Check if it's a role mismatch error
        if (error.message.toLowerCase().includes('does not have') || 
            error.message.toLowerCase().includes('privileges') ||
            error.message.toLowerCase().includes('staff login')) {
          setError('Access denied. Please use the Student Login Credentials.');
        } else if (error.message.includes('401') || error.message.toLowerCase().includes('invalid credentials')) {
          setError('Invalid PEN number or password. Please try again.');
        } else if (error.message.includes('403')) {
          setError('Access denied. You do not have student privileges.');
        } else if (error.message.includes('Network Error') || error.message.toLowerCase().includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="student-login">
      <div className="student-login-container">
        <div className="student-login-header">
          <div className="student-logo">
            <div className="logo-icon">🏫</div>
            <h1>Class Connect Student</h1>
          </div>
          <p className="student-subtitle">School Learning Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="student-login-form">
          <div className="form-group">
            <label htmlFor="panNumber">PEN Number</label>
            <input
              type="text"
              id="panNumber"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              placeholder="Enter your PEN number"
              required
              disabled={isLoading}
              className="student-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="student-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="student-login-btn"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="student-login-footer">
          <p>Student Credentials:</p>
          <p>Use your registered PEN number and password</p>
          <div className="signup-section">
            <p className="info-text">📝 New students should contact the admin office for registration</p>
          </div>
          <p className="admin-link">
            <a href="/admin/login">Admin Login</a>
          </p>
          <p className="teacher-link">
            <a href="/teacher/login">Teacher Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin; 
