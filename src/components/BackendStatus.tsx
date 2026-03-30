import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

interface BackendStatusProps {
  children: React.ReactNode;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Try to make a simple request to check if backend is running
        await api.get('/api/health', { timeout: 5000 });
        setIsBackendConnected(true);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsBackendConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendConnection();
  }, []);

  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        gap: '20px'
      }}>
        <div>🔄 Checking backend connection...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Please ensure your SpringBoot backend is running on https://classconnect.it.com
        </div>
      </div>
    );
  }

  if (isBackendConnected === false) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ color: '#d73527' }}>
          <strong>Backend Connection Failed</strong>
        </div>
        <div style={{ fontSize: '16px', color: '#666', maxWidth: '600px' }}>
          Unable to connect to the SpringBoot backend server. Please ensure:
        </div>
        <ul style={{ fontSize: '14px', color: '#666', textAlign: 'left', maxWidth: '500px' }}>
          <li>SpringBoot application is running on <code>https://classconnect.it.com</code></li>
          <li>MySQL database is running and accessible</li>
          <li>No firewall is blocking the connection</li>
          <li>CORS is properly configured in the backend</li>
        </ul>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry Connection
        </button>
        <div style={{ fontSize: '12px', color: '#999' }}>
          Make sure to start your SpringBoot backend before using this application
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BackendStatus;
