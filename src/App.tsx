import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import AuthService from './services/authService'
import { AuthProvider } from './contexts/AuthContext'

// Landing Page
import LandingPage from './pages/LandingPage'

// Student Pages
import StudentLogin from './pages/student/StudentLogin'
import StudentDashboard from './pages/student/StudentDashboard'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRegister from './pages/AdminRegister'

// Developer Pages
import DeveloperLogin from './pages/DeveloperLogin'

// Teacher Pages
import TeacherLogin from './pages/teacher/TeacherLogin'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherRegistration from './pages/teacher/TeacherRegistration'

import {delData} from './redux/DataSlice';
import { useDispatch } from "react-redux";

// Protected Route Component with Role-Based Access Control
interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole: 'student' | 'admin' | 'teacher';
  currentUserType: 'student' | 'admin' | 'teacher' | null;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  currentUserType, 
  isAuthenticated 
}) => {
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user is trying to access wrong dashboard
    if (isAuthenticated && currentUserType && currentUserType !== requiredRole) {
      const roleNames = {
        student: 'Student',
        admin: 'Admin',
        teacher: 'Teacher'
      };
      
      setErrorMessage(
        `Access Denied: You are logged in as ${roleNames[currentUserType]} but trying to access ${roleNames[requiredRole]} Dashboard. Please logout and login with correct credentials.`
      );
    }
  }, [isAuthenticated, currentUserType, requiredRole]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    const loginPaths = {
      student: '/',
      admin: '/admin',
      teacher: '/teacher'
    };
    return <Navigate to={loginPaths[requiredRole]} replace />;
  }

  // Authenticated but wrong role - show error and redirect
  if (currentUserType !== requiredRole) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '12px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#dc3545', marginBottom: '16px', fontSize: '24px' }}>
            Access Denied
          </h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            {errorMessage}
          </p>
          <button
            onClick={() => {
              const dashboards = {
                student: '/student/dashboard',
                admin: '/admin/dashboard',
                teacher: '/teacher/dashboard'
              };
              window.location.href = currentUserType ? dashboards[currentUserType] : '/';
            }}
            style={{
              padding: '12px 32px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Correct authentication and role
  return children;
};

// Developer Protected Route Component
interface DeveloperProtectedRouteProps {
  children: React.ReactElement;
}

const DeveloperProtectedRoute: React.FC<DeveloperProtectedRouteProps> = ({ children }) => {
  const isDeveloperAuthenticated = localStorage.getItem('developerAuth') === 'true';

  if (!isDeveloperAuthenticated) {
    return <Navigate to="/developer/login" replace />;
  }

  return children;
};

// Main App Content Component (needs to be inside Router to use navigation)
const AppContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<'student' | 'admin' | 'teacher' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount and restore session
  useEffect(() => {
    const restoreSession = () => {
      try {
        // Check if user has valid authentication token
        const isAuth = AuthService.isAuthenticated();
        const storedUserType = localStorage.getItem('userType') as 'student' | 'admin' | 'teacher' | null;

        if (isAuth && storedUserType) {
          setIsAuthenticated(true);
          setUserType(storedUserType);
          // console.log('Session restored:', { userType: storedUserType });
        } else {
          // Clear any stale data
          AuthService.logout();
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Set up token expiration check interval
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isAuthenticated && !AuthService.isAuthenticated()) {
        console.log('Token expired, logging out...');
        handleLogout();
        alert('Your session has expired. Please login again.');
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleStudentLogin = () => {
    setIsAuthenticated(true)
    setUserType('student')
  }

  const handleAdminLogin = () => {
    setIsAuthenticated(true)
    setUserType('admin')
  }

  const handleTeacherLogin = () => {
    setIsAuthenticated(true)
    setUserType('teacher')
  }

  const handleLogout = () => {
    // Store the current user type before clearing
    const currentUserType = userType;
    
    AuthService.logout();
    dispatch(delData());
    setIsAuthenticated(false)
    setUserType(null)
    
    // Navigate to appropriate login page based on user type
    if (currentUserType === 'admin') {
      navigate('/admin/login');
    } else if (currentUserType === 'teacher') {
      navigate('/teacher/login');
    } else if (currentUserType === 'student') {
      navigate('/student/login');
    } else {
      navigate('/'); // Fallback to landing page
    }
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e0e0e0',
            borderTop: '5px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Developer Routes */}
        <Route path="/developer/login" element={<DeveloperLogin />} />
        <Route 
          path="/developer/register-school" 
          element={
            <DeveloperProtectedRoute>
              <AdminRegister />
            </DeveloperProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student" 
          element={<Navigate to="/student/login" replace />} 
        />
        <Route 
          path="/student/login" 
          element={
            isAuthenticated && userType === 'student' ? 
              <Navigate to="/student/dashboard" replace /> : 
              <StudentLogin onLogin={handleStudentLogin} />
          } 
        />
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute 
              requiredRole="student" 
              currentUserType={userType} 
              isAuthenticated={isAuthenticated}
            >
              <StudentDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<Navigate to="/admin/login" replace />} 
        />
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated && userType === 'admin' ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <AdminLogin onLogin={handleAdminLogin} />
          } 
        />
        <Route 
          path="/admin/register" 
          element={<AdminRegister />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute 
              requiredRole="admin" 
              currentUserType={userType} 
              isAuthenticated={isAuthenticated}
            >
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teacher" 
          element={<Navigate to="/teacher/login" replace />} 
        />
        <Route 
          path="/teacher/login" 
          element={
            isAuthenticated && userType === 'teacher' ? 
              <Navigate to="/teacher/dashboard" replace /> : 
              <TeacherLogin onLogin={handleTeacherLogin} />
          } 
        />
        <Route 
          path="/teacher/register" 
          element={<TeacherRegistration />} 
        />
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute 
              requiredRole="teacher" 
              currentUserType={userType} 
              isAuthenticated={isAuthenticated}
            >
              <TeacherDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
};

// Main App Component - wraps everything in Router and AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App
