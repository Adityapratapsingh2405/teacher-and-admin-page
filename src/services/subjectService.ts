import { api } from './api';

// Interface definitions
export interface SubjectData {
  id?: number;
  subjectName: string;
  classId: number; // Required when creating
  teacherId?: number; // Optional - can be assigned later
  sessionId?: number;
}

export interface SubjectResponse {
  id: number;
  subjectName: string;
  classId: number;
  className?: string;
  teacherId?: number;
  teacherName?: string;
  sessionId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectSelectionResponse {
  id: number;
  subjectName: string;
  classId: number;
  className: string;
  sessionId?: number;
  isMain?: boolean;
  isGrade?: boolean;
}

export interface BulkSubjectData {
  classId: number;
  subjects: {
    subjectName: string;
    teacherId?: number;  // Optional - can be assigned later
  }[];
}

export class SubjectService {

  // SAve Selected Subjects
  static async saveSelectedSubjects(data:any){
    try {
      const response = await api.post('/subjects/save-selected-subjects', data);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to create subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to save selected subject';
      throw new Error(message);
    }
  }

  static async listSelectedSubjects(){
    try {
      const response = await api.get('/subjects/list-selected-subjects');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to create subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to save selected subject';
      throw new Error(message);
    }
  }


  // Create subject
  static async createSubject(subjectData: SubjectData) {
    try {
      const response = await api.post('/subjects', subjectData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create subject';
      throw new Error(message);
    }
  }

  // Create multiple subjects for a class
  static async createMultipleSubjects(bulkData: BulkSubjectData) {
    try {
      const response = await api.post('/subjects/multiple', bulkData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create subjects');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create subjects';
      throw new Error(message);
    }
  }

  // Update subject
  static async updateSubject(id: number, subjectData: SubjectData) {
    try {
      const response = await api.put(`/subjects/${id}`, subjectData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update subject';
      throw new Error(message);
    }
  }

  // Get subject by ID
  static async getSubjectById(id: number) {
    try {
      const response = await api.get(`/subjects/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subject';
      throw new Error(message);
    }
  }

  // Get all subjects
  static async getAllSubjects() {
    try {
      const response = await api.get('/subjects');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch subjects');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects';
      throw new Error(message);
    }
  }

  // Get subjects by class
  static async getSubjectsByClass(classId: number) {
    try {
      const response = await api.get(`/subjects/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch subjects for class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects for class';
      throw new Error(message);
    }
  }

  // Delete subject
  static async deleteSubject(subjectId: number, classId: number) {
    try {
      const response = await api.delete(`/subjects/subject/${subjectId}/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
      throw new Error(response.data.message || 'Failed to delete subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete subject';
      throw new Error(message);
    }
  }

}

export default SubjectService;
