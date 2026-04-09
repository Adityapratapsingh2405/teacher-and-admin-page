import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Student Login',
      icon: '👨‍🎓',
      description: 'Access your courses, assignments, and results',
      path: '/student/login',
      color: '#667eea'
    },
    {
      title: 'Teacher Login',
      icon: '👨‍🏫',
      description: 'Manage classes, attendance, and student progress',
      path: '/teacher/login',
      color: '#48bb78'
    },
    {
      title: 'Admin Login',
      icon: '👨‍💼',
      description: 'School administration and management',
      path: '/admin/login',
      color: '#ed8936'
    },
    // {
    //   title: 'Register School',
    //   icon: '🏫',
    //   description: 'Developer access to register new schools',
    //   path: '/developer/login',
    //   color: '#e53e3e',
    //   isDeveloper: true
    // }
  ];

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-header">
          <div className="main-logo">
            <div className="logo-circle">🎓</div>
            <h1>Class Connect</h1>
          </div>
          <h2>School Learning Management System</h2>
          <p>Comprehensive solution for modern education management</p>
        </div>

        <div className="login-options-grid">
          {loginOptions.map((option, index) => (
            <div
              key={index}
              className={`login-option-card`}
              onClick={() => navigate(option.path)}
              style={{ '--card-color': option.color } as React.CSSProperties}
            >
              <div className="card-icon">{option.icon}</div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              {/* {option.isDeveloper && (
                <div className="developer-tag">
                  <i className="fas fa-lock"></i> Restricted Access
                </div>
              )} */}
              <div className="card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>

        <div className="landing-footer">
          <p>&copy; 2025 ClassConnect.it.com - School Learning Management System</p>
          <p className="footer-links">
            <a href="#about">About</a>
            <span>•</span>
            <a href="#support">Support</a>
            <span>•</span>
            <a href="#privacy">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
