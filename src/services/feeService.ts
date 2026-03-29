import { api } from './api';

// Interface definitions
interface FeeStructureData {
  [key: string]: any;
}

export interface FeePaymentData {
  studentPanNumber: string;
  amount: number;
  month: string; // e.g., 'JANUARY', 'FEBRUARY'
  sessionId: number;
  classId: number;
  receiptNumber: string;
}

export interface FeeCatalog {
  studentId: string;
  monthlyFees: MonthlyFee[];
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface MonthlyFee {
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'unpaid' | 'overdue';
  paymentDate?: string;
  receiptNumber?: string;
}

export class FeeService {
  // Create fee structure
  static async createFeeStructure(feeStructureData: FeeStructureData) {
    try {
      const response = await api.post('/fees/structure', feeStructureData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create fee structure');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create fee structure';
      throw new Error(message);
    }
  }

  // Get fee structure by class
  static async getFeeStructureByClass(classId: string | number) {
    try {
      const response = await api.get(`/fees/structure/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee structure');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch fee structure';
      throw new Error(message);
    }
  }

  // Get current student's fee catalog
  static async getCurrentStudentFeeCatalog() {
    try {
      const response = await api.get('/fees/catalogs/me');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee catalog');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch fee catalog';
      throw new Error(message);
    }
  }

  // Process fee payment (Admin pays for student)
  static async processFeePayment(paymentData: FeePaymentData) {
    try {
      const response = await api.put('/fees/pay', paymentData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to process payment');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to process payment';
      throw new Error(message);
    }
  }

  // Get all fee catalogs for active session
  static async getAllFeeCatalogs(): Promise<FeeCatalog[]> {
    try {
      const response = await api.get('/fees/catalogs');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee catalogs');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch fee catalogs';
      throw new Error(message);
    }
  }

  // Get fee catalog by student PEN number
  static async getFeeCatalogByPan(panNumber: string): Promise<FeeCatalog> {
    try {
      const response = await api.get(`/fees/catalogs/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee catalog');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch fee catalog';
      throw new Error(message);
    }
  }

  // Mark pending fees as overdue
  static async markOverdueFees() {
    try {
      const response = await api.put('/fees/update-overdue');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to update overdue fees');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update overdue fees';
      throw new Error(message);
    }
  }

  // Get student fee history
  static async getStudentFeeHistory(studentId: string | number) {
    try {
      const response = await api.get(`/fees/student/${studentId}/history`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch fee history');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch fee history';
      throw new Error(message);
    }
  }

  // Get pending fees by class
  static async getPendingFeesByClass(classId: string | number) {
    try {
      const response = await api.get(`/fees/pending/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pending fees');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch pending fees';
      throw new Error(message);
    }
  }

  // Generate fee receipt
  static async generateFeeReceipt(paymentId: string | number) {
    try {
      const response = await api.get(`/fees/receipt/${paymentId}`, {
        responseType: 'blob'
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error('Failed to generate receipt');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to generate receipt';
      throw new Error(message);
    }
  }

  // Generate fees for a student who doesn't have fee records
  static async generateFeesForStudent(panNumber: string) {
    try {
      const response = await api.post(`/fees/generate/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to generate fees');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to generate fees';
      throw new Error(message);
    }
  }
}

export default FeeService;
