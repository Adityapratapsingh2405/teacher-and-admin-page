import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeveloperLogin.css';

interface DeveloperLoginProps {
  onLogin?: () => void;
}

const DeveloperLogin: React.FC<DeveloperLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Developer credentials (hardcoded for security)
  const DEVELOPER_CREDENTIALS = {
    username: 'slms_developer',
    email: 'developer@slms.com',
    password: 'SLMS@Dev2025'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate credentials
    if (
      username === DEVELOPER_CREDENTIALS.username &&
      email === DEVELOPER_CREDENTIALS.email &&
      password === DEVELOPER_CREDENTIALS.password
    ) {
      // Store developer session
      localStorage.setItem('developerAuth', 'true');
      localStorage.setItem('developerLoginTime', new Date().toISOString());
      
      if (onLogin) {
        onLogin();
      }
      navigate('/developer/register-school');
    } else {
      setError('Invalid developer credentials. Access denied.');
    }

    setIsLoading(false);
  };

  return (
    <div className="developer-login">
      <div className="developer-login-container">
        <div className="developer-login-header">
          <div className="developer-logo">
            <div className="logo-icon">🔧</div>
            <h1>Developer Portal</h1>
          </div>
          <p className="developer-subtitle">Class-Connect School Registration System</p>
          <div className="security-badge">
            <i className="fas fa-shield-alt"></i>
            <span>Restricted Access</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="developer-login-form">
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i> Developer Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter developer username"
              required
              className="developer-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Developer Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter developer email"
              required
              className="developer-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Developer Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter developer password"
              required
              className="developer-input"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="developer-login-btn"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Access Developer Portal
              </>
            )}
          </button>
        </form>

        <div className="developer-login-footer">
          <div className="warning-box">
            <i className="fas fa-exclamation-circle"></i>
            <p>This is a restricted area for Class-Connect developers only.</p>
            <p>Unauthorized access is strictly prohibited.</p>
          </div>
          <p className="back-link">
            <a href="/">
              <i className="fas fa-arrow-left"></i> Back to Main Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperLogin;
