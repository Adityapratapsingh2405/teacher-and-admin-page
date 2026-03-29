import { api } from './api';
import { TCRequest } from '../types';

export class TransferCertificateService {
  // Student: Request transfer certificate
  static async requestTransferCertificate(requestData: TCRequest) {
    try {
      const response = await api.post('/tc/request', {
        reason: requestData.reason,
        transferDate: requestData.transferDate,
        newSchoolName: requestData.newSchoolName,
        newSchoolAddress: requestData.newSchoolAddress,
        additionalDetails: requestData.additionalDetails
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to request transfer certificate');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to request transfer certificate';
      throw new Error(message);
    }
  }

  // Student: Get my transfer certificate requests
  static async getMyTransferCertificateRequests() {
    try {
      const response = await api.get('/tc/requests/me');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch transfer certificate requests');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch transfer certificate requests';
      throw new Error(message);
    }
  }

  // Admin: Get all TC requests (with optional status filter)
  static async getAllRequests(status?: string) {
    try {
      const url = status ? `/tc/requests?status=${status}` : '/tc/requests';
      const response = await api.get(url);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch requests');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch requests';
      throw new Error(message);
    }
  }
  
  // Admin: Get processed (approved/rejected) TC requests from last month
  static async getProcessedRequestsFromLastMonth() {
    try {
      const response = await api.get('/tc/processed/last-month');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch processed requests from last month');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch processed requests from last month';
      throw new Error(message);
    }
  }

  // Admin: Approve or reject TC request directly
  static async processRequest(requestId: number, decision: 'APPROVED' | 'REJECTED', adminReply: string) {
    try {
      const response = await api.put(`/tc/process/${requestId}`, {
        decision,
        adminReply
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to process request');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to process request';
      throw new Error(message);
    }
  }

  // Admin: Forward TC request to teacher (optional - if admin wants teacher input)
  static async forwardToTeacher(requestId: number, adminMessageToTeacher: string) {
    try {
      const response = await api.put(`/tc/${requestId}/forward-to-teacher`, {
        adminMessageToTeacher
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to forward request');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to forward request';
      throw new Error(message);
    }
  }

  // Teacher: Get TC requests forwarded to me
  static async getTeacherForwardedRequests() {
    try {
      const response = await api.get('/tc/forwarded-to-class-teacher');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch forwarded requests');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch forwarded requests';
      throw new Error(message);
    }
  }

  // Teacher: Reply to admin with approval/rejection
  static async replyToAdmin(requestId: number, status: 'APPROVED' | 'REJECTED', teacherReplyToAdmin: string) {
    try {
      const response = await api.put(`/tc/${requestId}/reply-to-admin`, {
        status,
        teacherReplyToAdmin
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to reply to admin');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reply to admin';
      throw new Error(message);
    }
  }

  // Get TC request by student PEN
  static async getRequestsByStudentPan(studentPan: string) {
    try {
      const response = await api.get(`/tc/requests/${studentPan}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch requests');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch requests';
      throw new Error(message);
    }
  }
}

export default TransferCertificateService;
