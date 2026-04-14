import { api } from './api';

// Interface definitions
export interface ClassData {
  className: string;
  feeAmount: number;
  sessionId: number;
  classTeacherId: number;  // Required field for class teacher
}

// Backend response interface (matches Java DTO)
interface BackendClassResponse {
  id: number;
  className: string;
  feesAmount: number;  // Backend uses 'feesAmount'
  totalStudents: number;  // Backend uses 'totalStudents'
  sessionId: number;
  sessionName: string;
  classTeacherId?: number;
  classTeacherName?: string;
  feeCollectionRate?: number;
  students?: any[];
}

// Frontend interface (what components expect)
export interface ClassResponse {
  id: number;
  className: string;
  feeAmount: number;  // Frontend uses 'feeAmount'
  studentCount: number;  // Frontend uses 'studentCount'
  sessionId: number;
  sessionName: string;
  classTeacherId?: number;
  classTeacherName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Map backend response to frontend interface
const mapBackendToFrontend = (backendClass: BackendClassResponse): ClassResponse => {
  return {
    id: backendClass.id,
    className: backendClass.className,
    feeAmount: backendClass.feesAmount || 0,  // Map feesAmount -> feeAmount
    studentCount: backendClass.totalStudents || 0,  // Map totalStudents -> studentCount
    sessionId: backendClass.sessionId,
    sessionName: backendClass.sessionName,
    classTeacherId: backendClass.classTeacherId,
    classTeacherName: backendClass.classTeacherName
  };
};

export class ClassService {
  // Get all classes (only from active session - backend limitation)
  static async getAllClasses(): Promise<ClassResponse[]> {
    try {
      // Backend /classes endpoint returns active session classes only
      const response = await api.get('/classes');
      
      if (response.status >= 200 && response.status < 300) {
        const backendClasses = response.data.data as BackendClassResponse[];
        return backendClasses.map(mapBackendToFrontend);
      }
      throw new Error('Failed to fetch classes');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch classes';
      throw new Error(message);
    }
  }

  // Get class by ID
  static async getClassById(id: string | number, sessionId?: number): Promise<ClassResponse> {
    try {
      // If sessionId is provided, use the specific endpoint
      const endpoint = sessionId 
        ? `/classes/${id}/session/${sessionId}`
        : `/classes/${id}`;
      
      const response = await api.get(endpoint);
      
      if (response.status >= 200 && response.status < 300) {
        const backendClass = response.data.data as BackendClassResponse;
        return mapBackendToFrontend(backendClass);
      }
      throw new Error(response.data.message || 'Failed to fetch class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch class';
      throw new Error(message);
    }
  }

  // Create new class
  static async createClass(classData: ClassData): Promise<ClassResponse> {
    try {
      // Map frontend data to backend format
      const backendData = {
        className: classData.className,
        feesAmount: classData.feeAmount,  // Map feeAmount -> feesAmount
        sessionId: classData.sessionId,
        classTeacherId: classData.classTeacherId  // Required field,
      };
      
      const response = await api.post('/classes', backendData);
      
      if (response.status >= 200 && response.status < 300) {
        const backendClass = response.data.data as BackendClassResponse;
        return mapBackendToFrontend(backendClass);
      }
      throw new Error(response.data.message || 'Failed to create class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create class';
      throw new Error(message);
    }
  }

  // Update class
  static async updateClass(id: string | number, classData: ClassData): Promise<ClassResponse> {
    try {
      // Map frontend data to backend format - Backend expects feesAmount
      const backendData = {
        className: classData.className,
        feesAmount: classData.feeAmount,  // Map feeAmount -> feesAmount for backend
        classTeacherId: classData.classTeacherId
      };
      
      // Backend uses PATCH /classes/{id} (not PUT)
      const response = await api.patch(`/classes/${id}`, backendData);
      
      if (response.status >= 200 && response.status < 300) {
        const backendClass = response.data.data as BackendClassResponse;
        return mapBackendToFrontend(backendClass);
      }
      throw new Error(response.data.message || 'Failed to update class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update class';
      throw new Error(message);
    }
  }

  // Delete class
  static async deleteClass(id: string | number, sessionId: number): Promise<void> {
    try {
      // Backend requires both classId and sessionId
      const response = await api.delete(`/classes/${id}/session/${sessionId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete class';
      throw new Error(message);
    }
  }

  /**
   * Get classes by session ID
   * IMPORTANT: Backend /classes endpoint only returns active session classes
   * For now, if the requested session is active, we'll get the classes
   * Otherwise, we return empty array (limitation of current backend)
   */
  static async getClassesBySession(sessionId: number): Promise<ClassResponse[]> {
    try {
      // First check if this is the active session
      const sessionsResponse = await api.get('/sessions');
      const sessions = sessionsResponse.data.data;
      const requestedSession = sessions.find((s: any) => s.id === sessionId);
      
      if (!requestedSession) {
        throw new Error('Session not found');
      }
      
      // Check if this is the active session
      const isActive = requestedSession.isActive || requestedSession.active;
      
      if (!isActive) {
        // Backend limitation: can only get classes from active session
        // Return empty array for non-active sessions
        console.warn(`Cannot fetch classes for non-active session ${sessionId}. Backend only supports active session.`);
        return [];
      }
      
      // Fetch classes from active session
      const response = await api.get('/classes');
      
      if (response.status >= 200 && response.status < 300) {
        const backendClasses = response.data.data as BackendClassResponse[];
        const mappedClasses = backendClasses.map(mapBackendToFrontend);
        
        // Double-check they match the requested sessionId
        return mappedClasses.filter((cls: ClassResponse) => cls.sessionId === sessionId);
      }
      return [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch classes by session');
    }
  }

  /**
   * Copy classes from one session to another
   */
  static async copyClassesFromSession(sourceSessionId: number, targetSessionId: number): Promise<ClassResponse[]> {
    try {
      const sourceClasses = await this.getClassesBySession(sourceSessionId);
      
      if (sourceClasses.length === 0) {
        throw new Error('No classes found in the source session');
      }

      const createdClasses: ClassResponse[] = [];
      for (const sourceClass of sourceClasses) {
        // Ensure classTeacherId is provided when copying
        if (!sourceClass.classTeacherId) {
          console.warn(`Skipping class ${sourceClass.className} - no class teacher assigned`);
          continue;
        }
        
        const newClass = await this.createClass({
          className: sourceClass.className,
          feeAmount: sourceClass.feeAmount,
          sessionId: targetSessionId,
          classTeacherId: sourceClass.classTeacherId
        });
        createdClasses.push(newClass);
      }

      return createdClasses;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to copy classes');
    }
  }

  /**
   * Validate class data
   */
  static validateClassData(className: string, feeAmount: number, sessionId: number, classTeacherId: number): string | null {
    if (!className || className.trim().length === 0) {
      return 'Class name is required';
    }
    if (className.trim().length > 50) {
      return 'Class name must be less than 50 characters';
    }
    if (!feeAmount || feeAmount < 0) {
      return 'Fee amount must be a positive number';
    }
    if (feeAmount > 1000000) {
      return 'Fee amount seems too high. Please verify.';
    }
    if (!sessionId) {
      return 'Session is required';
    }
    if (!classTeacherId) {
      return 'Class teacher is required';
    }
    return null;
  }

  /**
   * Check if class name exists in session
   */
  static async checkClassExists(className: string, sessionId: number, excludeClassId?: number): Promise<boolean> {
    try {
      const classes = await this.getClassesBySession(sessionId);
      return classes.some((cls: ClassResponse) => 
        cls.className.toLowerCase() === className.toLowerCase() && 
        cls.id !== excludeClassId
      );
    } catch (error) {
      return false;
    }
  }
}

export default ClassService;