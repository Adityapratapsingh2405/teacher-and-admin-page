import { api } from './api';

// Interface definitions
interface UserData {
  [key: string]: any;
}

type ChangePasswordRequest = {
  email: string | null;
  panNumber: string | null;
  userType: string | null;
  password: string | null;
  oldpassword: string | null;
};


export class UserManagementService {
  // Get all users
  static async getAllUsers() {
    try {
      const response = await api.get('/users');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch users');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      throw new Error(message);
    }
  }

  // Get user by ID
  static async getUserById(id: string | number) {
    try {
      const response = await api.get(`/users/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch user');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      throw new Error(message);
    }
  }

  // Create user
  static async createUser(userData: UserData) {
    try {
      const response = await api.post('/users', userData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create user');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create user';
      throw new Error(message);
    }
  }

  // Update user
  static async updateUser(id: string | number, userData: UserData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update user');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      throw new Error(message);
    }
  }

  // Delete user
  static async deleteUser(id: string | number) {
    try {
      const response = await api.delete(`/users/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
      throw new Error(response.data.message || 'Failed to delete user');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete user';
      throw new Error(message);
    }
  }

  // Change user password
  static async changeUserPassword(data:ChangePasswordRequest) {
    try {
      console.log(data);
      const response = await api.put(`/users/change-password`, data);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.message;
      }
      throw new Error(response.data.message || 'Failed to change password');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to change password';
      throw new Error(message);
    }
  }

  // Reset user password
  static async resetUserPassword(id: string | number) {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to reset password');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      throw new Error(message);
    }
  }

  // Update user status
  static async updateUserStatus(id: string | number, status: string) {
    try {
      const response = await api.patch(`/users/${id}/status`, { status });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update user status');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update user status';
      throw new Error(message);
    }
  }

  // Get users by role
  static async getUsersByRole(role: string) {
    try {
      const response = await api.get(`/users/role/${role}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch users by role');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users by role';
      throw new Error(message);
    }
  }
}

export default UserManagementService;