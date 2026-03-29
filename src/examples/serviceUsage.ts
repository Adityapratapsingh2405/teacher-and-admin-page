// Example of correct AuthService usage

// Method 1: Direct import
import AuthService from '../services/authService'

// Method 2: Import with alias
import { AuthService as Auth } from '../services/authService'

// Example usage:
export const loginExample = async () => {
  try {
    // Student login
    const studentResponse = await AuthService.loginStudent({
      panNumber: 'PEN123456',
      password: 'password123'
    });
    
    console.log('Student login successful:', studentResponse);
    
    // Staff login (Admin/Teacher)
    const staffResponse = await AuthService.loginStaff({
      email: 'admin@school.com',
      password: 'admin123'
    });
    
    console.log('Staff login successful:', staffResponse);
    
    // Logout
    await AuthService.logout();
    console.log('Logged out successfully');
    
  } catch (error) {
    console.error('Authentication error:', error);
  }
};

// Using the aliased import
export const loginWithAlias = async () => {
  try {
    const response = await Auth.loginStudent({
      panNumber: 'PEN123456',
      password: 'password123'
    });
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
