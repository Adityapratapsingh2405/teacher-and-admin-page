// Authentication test utility
import AuthService from '../services/authService';

interface TestCredentials {
  email?: string;
  panNumber?: string;
  password: string;
}

export class AuthTestUtil {
  // Test staff login
  static async testStaffLogin(credentials: TestCredentials) {
    console.log('Testing staff login with:', credentials);
    try {
      const result = await AuthService.loginStaff(credentials);
      console.log('Staff login successful:', result);
      console.log('Auth debug info:', AuthService.getAuthDebugInfo());
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Staff login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test student login
  static async testStudentLogin(credentials: TestCredentials) {
    console.log('Testing student login with:', credentials);
    try {
      const result = await AuthService.loginStudent(credentials);
      console.log('Student login successful:', result);
      console.log('Auth debug info:', AuthService.getAuthDebugInfo());
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Student login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test API connectivity
  static async testAPIConnectivity() {
    const testUrl = 'http://3.110.94.0:8080/api';
    try {
      const response = await fetch(testUrl);
      console.log('API connectivity test - Status:', response.status);
      return { 
        success: response.status !== 0, 
        status: response.status,
        message: response.status === 0 ? 'API server not reachable' : 'API server reachable'
      };
    } catch (error: any) {
      console.error('API connectivity test failed:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Cannot connect to API server'
      };
    }
  }

  // Get current authentication status
  static getAuthStatus() {
    const debugInfo = AuthService.getAuthDebugInfo();
    console.log('Current authentication status:', debugInfo);
    return debugInfo;
  }
}

export default AuthTestUtil;
