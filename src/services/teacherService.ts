import { api } from './api';

// Interface definitions
interface TeacherFilter {
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
  name?: string;
  designation?: string;
  status?: string;
}

interface TeacherData {
  [key: string]: any;
}

export class TeacherService {
  // Get teacher by ID
  static async getTeacherById(id: string | number) {
    try {
      const response = await api.get(`/teachers/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teacher';
      throw new Error(message);
    }
  }

  // Get current teacher profile (for logged-in teacher)
  static async getCurrentTeacher() {
    try {
      const response = await api.get('/teachers/me');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch current teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch current teacher';
      throw new Error(message);
    }
  }

  // Get all teachers with pagination and filtering
  static async getAllTeachers(filter: TeacherFilter = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filter.page !== undefined) params.append('page', filter.page.toString());
      if (filter.size !== undefined) params.append('size', filter.size.toString());
      if (filter.sort) params.append('sort', filter.sort);
      if (filter.direction) params.append('direction', filter.direction);
      if (filter.name) params.append('name', filter.name);
      if (filter.designation) params.append('designation', filter.designation);
      if (filter.status) params.append('status', filter.status);

      const response = await api.get(`/teachers?${params.toString()}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teachers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teachers';
      throw new Error(message);
    }
  }

  // Get active teachers
  static async getActiveTeachers() {
    try {
      const response = await api.get('/teachers/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch active teachers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch active teachers';
      throw new Error(message);
    }
  }

  // Update teacher profile
  static async updateTeacher(id: string | number, teacherData: TeacherData) {
    try {
      const response = await api.put(`/teachers/update/${id}`, teacherData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update teacher';
      throw new Error(message);
    }
  }

  // Get teachers by subject
  static async getTeachersBySubject(subjectId: string | number) {
    try {
      const response = await api.get(`/teachers/subject/${subjectId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teachers by subject');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teachers by subject';
      throw new Error(message);
    }
  }

  // Get teacher classes
  static async getTeacherClasses(teacherId: string | number) {
    try {
      const response = await api.get(`/teachers/${teacherId}/classes`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teacher classes');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teacher classes';
      throw new Error(message);
    }
  }

  // Delete teacher
  static async deleteTeacher(id: string | number) {
    try {
      const response = await api.delete(`/teachers/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to delete teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete teacher';
      throw new Error(message);
    }
  }

  // Get teacher's timetable
  static async getTeacherTimeTable() {
    try {
      const response = await api.get('/timetables/teacher/me');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch timetable');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch timetable';
      throw new Error(message);
    }
  }

  // Get students by class ID
  static async getStudentsByClass(classId: number) {
    try {
      const response = await api.get(`/students/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students';
      throw new Error(message);
    }
  }

  // Get all active students
  static async getAllActiveStudents() {
    try {
      const response = await api.get('/students/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students';
      throw new Error(message);
    }
  }

  // Get student details by PEN number
  static async getStudentByPan(panNumber: string) {
    try {
      const response = await api.get(`/students/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch student details');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student details';
      throw new Error(message);
    }
  }

  // Get TC requests forwarded to teacher
  static async getTCRequestsForTeacher() {
    try {
      const response = await api.get('/transfer-certificate/forwarded-to-class-teacher');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch TC requests');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch TC requests';
      throw new Error(message);
    }
  }

  // Reply to TC request
  static async replyToTCRequest(tcRequestId: number, teacherResponse: string, teacherRemarks: string) {
    try {
      const response = await api.put(`/transfer-certificate/${tcRequestId}/reply-to-admin`, {
        teacherResponse,
        teacherRemarks
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit TC response');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit TC response';
      throw new Error(message);
    }
  }

  // Get attendance for a class and session
  static async getClassAttendance(classId: number, sessionId: number) {
    try {
      const response = await api.get(`/attendance/class/${classId}/session/${sessionId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch attendance');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch attendance';
      throw new Error(message);
    }
  }

  // Submit attendance
  static async submitAttendance(attendanceData: any) {
    try {
      const response = await api.post('/attendance', attendanceData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit attendance');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit attendance';
      throw new Error(message);
    }
  }

  // Update attendance
  static async updateAttendance(date: string, attendanceData: any) {
    try {
      const response = await api.put(`/attendance/${date}`, attendanceData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update attendance');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update attendance';
      throw new Error(message);
    }
  }

  // Get scores for a class and exam
  static async getClassScores(examId: number, classId: number) {
    try {
      const response = await api.get(`/scores/exam/${examId}/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch scores');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch scores';
      throw new Error(message);
    }
  }

  // Submit score
  static async submitScore(scoreData: any) {
    try {
      const response = await api.post('/scores', scoreData);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit score');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit score';
      throw new Error(message);
    }
  }

  // Update score
  static async updateScore(examId: number, classId: number, subjectId: number, panNumber: string, scoreData: any) {
    try {
      const response = await api.patch(
        `/scores/exam/${examId}/class/${classId}/subject/${subjectId}/pan/${panNumber}`,
        scoreData
      );
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update score');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update score';
      throw new Error(message);
    }
  }

  // Get exams for a class
  static async getClassExams(classId: number) {
    try {
      const response = await api.get(`/exams/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch exams');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch exams';
      throw new Error(message);
    }
  }

  // Get subjects for a class
  static async getClassSubjects(classId: number) {
    try {
      const response = await api.get(`/subjects/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch subjects');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch subjects';
      throw new Error(message);
    }
  }

  // Get all classes
  static async getAllClasses() {
    try {
      const response = await api.get('/classes');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch classes');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch classes';
      throw new Error(message);
    }
  }

  // Get student scores by PEN
  static async getStudentScores(panNumber: string) {
    try {
      const response = await api.get(`/scores/pan/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch student scores');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student scores';
      throw new Error(message);
    }
  }
}

export default TeacherService;
