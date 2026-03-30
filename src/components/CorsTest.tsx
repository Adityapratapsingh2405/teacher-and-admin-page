import React, { useState } from 'react';
import { api } from '../services/api.js';

const CorsTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testBackendConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test 1: Health check
      console.log('Testing health endpoint...');
      const healthResponse = await api.get('/api/health');
      console.log('Health check successful:', healthResponse.data);
      
      // Test 2: Try login endpoint with OPTIONS (preflight)
      console.log('Testing login endpoint...');
      const loginTest = await api.post('/api/auth/login', {
        email: 'admin@company.com',
        password: 'temporaryStrongPassword!123'
      });
      
      console.log('Login test response:', loginTest.data);
      setTestResult('✅ Backend connection successful! CORS is working properly.');
      
    } catch (error: any) {
      console.error('Connection test failed:', error);
      
      if (error.message.includes('CORS')) {
        setTestResult('❌ CORS Error: Backend CORS configuration needs to be updated.');
      } else if (error.response) {
        // Server responded with error
        setTestResult(`✅ CORS is working, but got server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // Request was made but no response
        setTestResult('❌ Network Error: Backend server is not running or not accessible.');
      } else {
        setTestResult(`❌ Unknown Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔧 Backend Connection Test</h3>
      <p>Use this to test if the backend is running and CORS is configured properly.</p>
      
      <button 
        onClick={testBackendConnection} 
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: testResult.startsWith('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Make sure your SpringBoot backend is running on https://classconnect.it.com</li>
          <li>Click "Test Backend Connection" to verify CORS configuration</li>
          <li>Check the browser console for detailed error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default CorsTest;
