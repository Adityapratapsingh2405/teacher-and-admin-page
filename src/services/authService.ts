import { api, RestResponse } from './api';

export interface LoginCredentials {
  email?: string;
  panNumber?: string;
  password: string;
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface StaffRegistrationData {
  name: string;
  email: string;
  password: string;
  contactNumber: string;
  qualification: string;
  designation: string;
  joiningDate: string; // Should be in YYYY-MM-DD format for LocalDate
  salaryGrade: string;
  roles: string[]; // Array of role strings like ['ROLE_ADMIN', 'ROLE_TEACHER']
}

export interface StudentRegistrationData {
  panNumber: string;
  name: string;
  password: string;
  mobileNumber: string;
  address: string;
  dateOfBirth: string; // Should be in YYYY-MM-DD format for LocalDate
  gender: string; // Should match Gender enum: MALE, FEMALE, OTHER
  bloodGroup: string;
  parentName: string;
  emergencyContact: string;
  previousSchool?: string;
  classId: number;
  sessionId: number;
  photo?: string; // Photo as base64 string or URL
  transport?:boolean;
  motherName?:string;
}

export class AuthService {
  // Decode JWT token to get user roles
  private static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Validate if token contains expected role
  private static validateRole(token: string, expectedRole: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.roles) {
      return false;
    }
    
    // Check if the user has the expected role
    const roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    return roles.includes(expectedRole);
  }

  // Staff login (Admin, Teacher, Non-teaching staff)
  static async loginStaff(credentials: LoginCredentials, expectedRole?: 'ROLE_ADMIN' | 'ROLE_TEACHER'): Promise<AuthData> {
    try {
      const response = await api.post<RestResponse<AuthData>>('/auth/login', credentials);
      
      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        const authData = response.data.data;
        
        // Validate role if expectedRole is provided
        if (expectedRole && !this.validateRole(authData.accessToken, expectedRole)) {
          throw new Error(`Access denied. This account does not have ${expectedRole.replace('ROLE_', '')} privileges. Please use the correct login page.`);
        }
        
        // Store authentication data
        this.storeAuthData(authData);
        
        return authData;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }

  // Student login
  static async loginStudent(credentials: LoginCredentials): Promise<AuthData> {
    try {
      const response = await api.post<RestResponse<AuthData>>('/auth/student/login', credentials);
      
      // Check if response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        const authData = response.data.data;
        
        // Validate that user has ROLE_STUDENT
        if (!this.validateRole(authData.accessToken, 'ROLE_STUDENT')) {
          throw new Error('Access denied. This account does not have student privileges. Please use the staff login page.');
        }
        
        // Store authentication data
        this.storeAuthData(authData, 'STUDENT');
        
        return authData;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }

  // Register staff (Admin, Teacher, Non-teaching staff)
  static async registerStaff(staffData: StaffRegistrationData): Promise<any> {
    try {
      const response = await api.post('/auth/register/staff', staffData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  }

  // Register student
  static async registerStudent(studentData: StudentRegistrationData): Promise<any> {
    try {
      const response = await api.post('/auth/register/student', studentData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  }

  // Upload students from Excel file
  static async uploadStudents(file: File, classId: number): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', classId.toString());

      const response = await api.post('/auth/upload-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Upload failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Upload failed';
      throw new Error(message);
    }
  }

  // Logout
  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenIssuedAt');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('panNumber');
    localStorage.removeItem('schoolId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  // Store authentication data with timestamp
  private static storeAuthData(authData: AuthData, userRole?: string) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTime = currentTimestamp + authData.expiresIn;
    
    localStorage.setItem('authToken', authData.accessToken);
    localStorage.setItem('tokenType', authData.tokenType);
    localStorage.setItem('expiresIn', authData.expiresIn.toString());
    localStorage.setItem('tokenIssuedAt', currentTimestamp.toString());
    localStorage.setItem('tokenExpiresAt', expirationTime.toString());
    
    // Decode token to extract additional information like schoolId and roles
    const decoded = this.decodeToken(authData.accessToken);
    if (decoded) {
      // Extract and store schoolId from JWT payload
      if (decoded.schoolId) {
        localStorage.setItem('schoolId', decoded.schoolId.toString());
      }
      
      // Extract and store roles from JWT payload
      if (decoded.roles) {
        const roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
        // Store the first role or the most relevant one
        if (roles.length > 0) {
          localStorage.setItem('userRole', roles[0]);
        }
      }
      
      // Store user info if available in token
      if (decoded.sub) {
        localStorage.setItem('userEmail', decoded.sub);
      }
      if (decoded.userId) {
        localStorage.setItem('userId', decoded.userId.toString());
      }
      if (decoded.name) {
        localStorage.setItem('userName', decoded.name);
      }
    }
    
    // Override with explicit userRole if provided
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    }
  }
  // Check if user is authenticated
  static isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token || !tokenExpiresAt) {
      return false;
    }

    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = parseInt(tokenExpiresAt);
    
    if (currentTime >= expirationTime) {
      this.logout();
      return false;
    }

    return true;
  }

  // Get stored auth token
  static getToken() {
    return localStorage.getItem('authToken');
  }

  // Get user role
  static getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Debug method to check authentication state
  static getAuthDebugInfo() {
    return {
      hasToken: !!localStorage.getItem('authToken'),
      tokenType: localStorage.getItem('tokenType'),
      userRole: localStorage.getItem('userRole'),
      userType: localStorage.getItem('userType'),
      tokenIssuedAt: localStorage.getItem('tokenIssuedAt'),
      tokenExpiresAt: localStorage.getItem('tokenExpiresAt'),
      currentTime: Math.floor(Date.now() / 1000),
      isAuthenticated: this.isAuthenticated()
    };
  }
}

export default AuthService;