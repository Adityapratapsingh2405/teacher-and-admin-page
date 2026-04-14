import { api, RestResponse } from './api';

// Interfaces matching backend DTOs
export interface StudentResponse {
  panNumber: string;
  name: string;
  photo?: string;
  classId: number;
  className: string;
  currentClass: string; // Just the class number (e.g., "1", "10")
  section: string; // Just the section (e.g., "A", "B")
  classRollNumber: number;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  feeCatalogStatus: 'UP_TO_DATE' | 'PENDING' | 'OVERDUE';
  parentName: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  admissionDate: string;
  previousSchool?: string;
  sessionName: string;
  sessionId: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface TeacherResponse {
  id: number;
  name: string;
  email: string;
  qualification: string;
  salaryGrade: string;
  contactNumber: string;
  userId: number;
  designation: string;
  joiningDate: string;
  classId?: number[];
  className?: string[];
  subjectName?: string[];
  subjectId?: number[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface NonTeachingStaffResponse {
  id: number; // NonTeachingStaff entity ID
  name: string;
  email: string;
  qualification: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  salaryGrade: string;
  designation: string;
  contactNumber: string;
  joiningDate: string;
  userId: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ClassInfoResponse {
  id: number;
  className: string;
  feeAmount: number;
  studentCount: number;
  sessionId: number;
  sessionName: string;
  classTeacherId?: number;
  classTeacherName?: string;
}

type BulkStudentDataType = {  
  panNumber: string | null;
  name: string | null;
  gender: string | null;
  className: string | null;
  sessionName: string | null;
  fatherName: string | null;
  mobile: string | null;
};
type BulkTeacherDataType = {  
  name: string | null;
  email : string | null;
  mobile: string | null;
};

export class AdminService {
  // ============ Student APIs ============

  // Bulk-Student Entry
  static async bulkStudents(data:BulkStudentDataType): Promise<string>
  {
    try{
      const response = await api.post('/auth/register/bulkstudent', data);
      return response.data.data;
    }catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Student Not Save';
     return message;
    }
  }

  static async bulkTeachers(data:BulkTeacherDataType): Promise<string>
  {
    try{
      const response = await api.post('/auth/register/bulkteacher', data);
      console.log(response)
      return response.data.data;
    }catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Teacher Not Save';
     return message;
    }
  }



  
  // Get all students
  static async getAllStudents(): Promise<StudentResponse[]> {
    try {
      const response = await api.get<RestResponse<StudentResponse[]>>('/students');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students';
      console.error('Failed to fetch students:', message);
      throw new Error(message);
    }
  }

  // Get active students only
  static async getActiveStudents(): Promise<StudentResponse[]> {
    try {
      const response = await api.get<RestResponse<StudentResponse[]>>('/students/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch active students');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch active students';
      console.error('Failed to fetch active students:', message);
      throw new Error(message);
    }
  }

  // Get student by PEN number
  static async getStudentByPEN(panNumber: string): Promise<StudentResponse> {
    try {
      const response = await api.get<RestResponse<StudentResponse>>(`/students/${panNumber}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch student');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student';
      throw new Error(message);
    }
  }

  // Get students by class ID
  static async getStudentsByClassId(classId: number): Promise<StudentResponse[]> {
    try {
      const response = await api.get<RestResponse<StudentResponse[]>>(`/students/class/${classId}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch students by class');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch students by class';
      throw new Error(message);
    }
  }

  // Update student status (reactivate/deactivate/graduate)
  static async updateStudentStatus(panNumbers: string[], status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED'): Promise<void> {
    try {
      // Backend PUT /students/status accepts { panNumbers: string[], status: UserStatus }
      const response = await api.put('/students/status', {
        panNumbers,
        status
      });
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || `Failed to update student status to ${status}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to update student status to ${status}`;
      throw new Error(message);
    }
  }

  // Reactivate students (convenience method)
  static async reactivateStudents(panNumbers: string[]): Promise<void> {
    return this.updateStudentStatus(panNumbers, 'ACTIVE');
  }

  // Deactivate students (convenience method)
  static async deactivateStudents(panNumbers: string[]): Promise<void> {
    return this.updateStudentStatus(panNumbers, 'INACTIVE');
  }

  // Mark students as graduated (convenience method)
  static async graduateStudents(panNumbers: string[]): Promise<void> {
    return this.updateStudentStatus(panNumbers, 'GRADUATED');
  }

  // ============ Teacher APIs ============
  
  // Get all teachers
  static async getAllTeachers(): Promise<TeacherResponse[]> {
    try {
      const response = await api.get<RestResponse<TeacherResponse[]>>('/teachers');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch teachers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teachers';
      console.error('Failed to fetch teachers:', message);
      throw new Error(message);
    }
  }

  // Get active teachers only
  static async getActiveTeachers(): Promise<TeacherResponse[]> {
    try {
      const response = await api.get<RestResponse<TeacherResponse[]>>('/teachers/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch active teachers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch active teachers';
      console.error('Failed to fetch active teachers:', message);
      throw new Error(message);
    }
  }
  
  // Get inactive teachers only
  static async getInactiveTeachers(): Promise<TeacherResponse[]> {
    try {
      const response = await api.get<RestResponse<TeacherResponse[]>>('/teachers/inactive');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch inactive teachers');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch inactive teachers';
      console.error('Failed to fetch inactive teachers:', message);
      throw new Error(message);
    }
  }

  // Get teacher by ID
  static async getTeacherById(id: number): Promise<TeacherResponse> {
    try {
      const response = await api.get<RestResponse<TeacherResponse>>(`/teachers/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch teacher');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teacher';
      throw new Error(message);
    }
  }

  // Deactivate teacher
  static async deactivateTeacher(id: number): Promise<void> {
    try {
      // Backend PUT /teachers/deactivate/{id} deactivates the teacher
      const response = await api.put(`/teachers/deactivate/${id}`);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || 'Failed to deactivate teacher');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to deactivate teacher';
      throw new Error(message);
    }
  }
  
  // Reactivate teacher
  static async reactivateTeacher(id: number): Promise<void> {
    try {
      // Backend PUT /teachers/activate/{id} reactivates the teacher
      const response = await api.put(`/teachers/activate/${id}`);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || 'Failed to reactivate teacher');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reactivate teacher';
      throw new Error(message);
    }
  }

  // ============ Non-Teaching Staff APIs ============
  
  // Get all non-teaching staff
  static async getAllNonTeachingStaff(): Promise<NonTeachingStaffResponse[]> {
    try {
      const response = await api.get<RestResponse<NonTeachingStaffResponse[]>>('/nts');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch non-teaching staff');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch non-teaching staff';
      console.error('Failed to fetch non-teaching staff:', message);
      throw new Error(message);
    }
  }

  // Get active non-teaching staff
  static async getActiveNonTeachingStaff(): Promise<NonTeachingStaffResponse[]> {
    try {
      const response = await api.get<RestResponse<NonTeachingStaffResponse[]>>('/nts/active');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch active non-teaching staff');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch active non-teaching staff';
      console.error('Failed to fetch active non-teaching staff:', message);
      throw new Error(message);
    }
  }
  
  // Get inactive non-teaching staff
  static async getInactiveNonTeachingStaff(): Promise<NonTeachingStaffResponse[]> {
    try {
      const response = await api.get<RestResponse<NonTeachingStaffResponse[]>>('/nts/inactive');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch inactive non-teaching staff');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch inactive non-teaching staff';
      console.error('Failed to fetch inactive non-teaching staff:', message);
      throw new Error(message);
    }
  }

  // Get non-teaching staff by ID
  static async getNonTeachingStaffById(id: number): Promise<NonTeachingStaffResponse> {
    try {
      const response = await api.get<RestResponse<NonTeachingStaffResponse>>(`/nts/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch non-teaching staff');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch non-teaching staff';
      throw new Error(message);
    }
  }

  // Update non-teaching staff
  static async updateNonTeachingStaff(id: number, data: {
    name: string;
    email: string;
    qualification?: string;
    salaryGrade?: string;
    contactNumber: string;
    designation?: string;
  }): Promise<void> {
    try {
      const response = await api.put(`/nts/update/${id}`, data);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || 'Failed to update non-teaching staff');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update non-teaching staff';
      throw new Error(message);
    }
  }

  // Deactivate non-teaching staff
  static async deactivateNonTeachingStaff(id: number): Promise<void> {
    try {
      // Backend PUT /nts/{id} deactivates the staff
      const response = await api.put(`/nts/${id}`);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || 'Failed to deactivate non-teaching staff');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to deactivate non-teaching staff';
      throw new Error(message);
    }
  }
  // Reactivate non-teaching staff
  static async reactivateNonTeachingStaff(id: number): Promise<void> {
    try {
      // Backend has PUT /nts/activate/{id} for reactivation
      const response = await api.put(`/nts/activate/${id}`);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.message || 'Failed to reactivate non-teaching staff');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reactivate non-teaching staff';
      throw new Error(message);
    }
  }

  // ============ Class APIs ============
  
  // Get all classes in active session
  static async getAllClasses(): Promise<ClassInfoResponse[]> {
    try {
      const response = await api.get<RestResponse<ClassInfoResponse[]>>('/classes');
      
      if (response.status >= 200 && response.status < 300) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch classes');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch classes';
      console.error('Failed to fetch classes:', message);
      throw new Error(message);
    }
  }

  // ============ Statistics ============
  
  // Calculate statistics from data
  static calculateStats(students: StudentResponse[], teachers: TeacherResponse[], classes: ClassInfoResponse[]) {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'ACTIVE').length;
    
    // Fee collection calculation
    const paidStudents = students.filter(s => s.feeStatus === 'PAID').length;
    const feeCollectionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;
    
    // Pending requests (students with pending fee status)
    const pendingRequests = students.filter(s => s.feeStatus === 'PENDING' || s.feeStatus === 'OVERDUE').length;
    
    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      feeCollectionRate,
      pendingRequests,
      totalClasses: classes.length
    };
  }
}

export default AdminService;
