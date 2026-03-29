import { api } from './api';

// Interface definitions
interface StudentFilter {
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
  name?: string;
  className?: string;
  status?: string;
  feeStatus?: string;
  sessionId?: number;
}

interface StudentData {
  [key: string]: any;
}

interface StatusData {
  [key: string]: any;
}

export class StudentService {
  // Get all students with pagination and filtering
  static async getAllStudents(filter: StudentFilter = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filter.page !== undefined) params.append('page', filter.page.toString());
      if (filter.size !== undefined) params.append('size', filter.size.toString());
      if (filter.sort) params.append('sort', filter.sort);
      if (filter.direction) params.append('direction', filter.direction);
      if (filter.name) params.append('name', filter.name);
      if (filter.className) params.append('className', filter.className);
      if (filter.status) params.append('status', filter.status);
      if (filter.feeStatus) params.append('feeStatus', filter.feeStatus);
      if (filter.sessionId) params.append('sessionId', filter.sessionId.toString());

      const response = await api.get(`/students?${params.toString()}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students';
      throw new Error(message);
    }
  }

  // Get active students
  static async getActiveStudents() {
    try {
      const response = await api.get('/students/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch active students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch active students';
      throw new Error(message);
    }
  }

  // Get current logged-in student's own data (for student dashboard)
  static async getCurrentStudent() {
    try {
      const response = await api.get('/students/me');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student';
      throw new Error(message);
    }
  }

  // Get student by PEN number (for admin/teacher use)
  static async getStudentByPan(panNumber: string) {
    try {
      const response = await api.get(`/students/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student';
      throw new Error(message);
    }
  }

  // Create new student
  static async createStudent(studentData: StudentData) {
    try {
      const response = await api.post('/students', studentData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create student';
      throw new Error(message);
    }
  }

  // Update student information
  static async updateStudent(panNumber: string, studentData: StudentData) {
    try {
      const response = await api.put(`/students/${panNumber}`, studentData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update student';
      throw new Error(message);
    }
  }

  // Get students by class
  static async getStudentsByClass(classId: string | number) {
    try {
      const response = await api.get(`/students/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch students by class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students by class';
      throw new Error(message);
    }
  }

  // Get students by teacher
  static async getStudentsByTeacher(teacherId: string | number) {
    try {
      const response = await api.get(`/students/teacher/${teacherId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch students by teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students by teacher';
      throw new Error(message);
    }
  }

  // Update student status (bulk update - backend requires array of PEN numbers)
  static async updateStudentStatus(panNumber: string, statusData: StatusData) {
    try {
      // Backend expects an array of panNumbers and status
      const requestBody = {
        panNumbers: [panNumber],
        status: statusData.status
      };
      
      const response = await api.put('/students/status', requestBody);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to update student status');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update student status';
      throw new Error(message);
    }
  }

  // Get students by session
  static async getStudentsBySession(sessionId: string | number) {
    try {
      const response = await api.get(`/students/session/${sessionId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch students by session');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students by session';
      throw new Error(message);
    }
  }

  // Delete student
  static async deleteStudent(panNumber: string) {
    try {
      const response = await api.delete(`/students/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to delete student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete student';
      throw new Error(message);
    }
  }

  // Assign roll numbers alphabetically for a class
  static async assignRollNumbersAlphabetically(classId: number) {
    try {
      const response = await api.put(`/students/class/${classId}/assign-roll-numbers-alphabetically`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to assign roll numbers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to assign roll numbers';
      throw new Error(message);
    }
  }

  // Reassign roll numbers for a class (sequential)
  static async reassignRollNumbers(classId: number) {
    try {
      const response = await api.put(`/students/class/${classId}/reassign-roll-numbers`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to reassign roll numbers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reassign roll numbers';
      throw new Error(message);
    }
  }

  // Promote students to a new class
  static async promoteStudentsToClass(panNumbers: string[], classId: number) {
    try {
      const response = await api.put(`/students/promote-to/${classId}`, panNumbers);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to promote students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to promote students';
      throw new Error(message);
    }
  }


  // Swap roll numbers of two students
  static async swapRollNumbers(panNumber1: string, panNumber2: string) {
    try {
      const response = await api.put(`/students/swap-roll-numbers?panNumber1=${panNumber1}&panNumber2=${panNumber2}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to swap roll numbers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to swap roll numbers';
      throw new Error(message);
    }
  }
}

export default StudentService;
