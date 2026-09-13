import api from './api';

// Type definitions
export interface StudentScoreEntry {
  studentPanNumber: string;
  marks: number;
  grade: string;
}

export interface BulkScoreUpdate {
  classId: number;
  subjectId: number;
  examId?: number; // Made optional
  scores: StudentScoreEntry[];
}

export interface SubjectScore {
  subjectId: number;
  subjectName: string;
  marks: number;
  maxMarks: number;
  grade: string;
}

export interface ExamResult {
  examId: number;
  examName: string;
  examDate: string;
  subjectScores: SubjectScore[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
}

export interface StudentResultsDTO {
  studentPanNumber: string;
  studentName: string;
  className: string;
  section: string;
  examResults: ExamResult[];
}

export interface SubjectInfo {
  subjectId: number;
  subjectName: string;
  maxMarks: number;
}

export interface SubjectMarks {
  subjectId: number;
  subjectName: string;
  marks: number;
  grade: string;
}

export interface StudentResult {
  panNumber: string;
  studentName: string;
  rollNumber: string;
  marks: SubjectMarks[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
}

export interface ClassResultsDTO {
  classId: number;
  className: string;
  section: string;
  examId: number;
  examName: string;
  subjects: SubjectInfo[];
  studentResults: StudentResult[];
}

export interface ScoreResponseDTO {
  id: number;
  studentPanNumber: string;
  subjectId: number;
  subjectName: string;
  examId: number;
  examName: string;
  classId: number;
  className: string;
  marks: number;
  grade: string;
}

// Service methods
const resultService = {
  /**
   * Bulk update scores for multiple students
   */
  bulkUpdateScores: async (bulkScoreUpdate: BulkScoreUpdate): Promise<ScoreResponseDTO[]> => {
    const response = await api.post<ScoreResponseDTO[]>('/results/bulk-update', bulkScoreUpdate);
    return response.data;
  },

  /**
   * Get all results for a class in a specific exam
   */
  getClassResultsForExam: async (classId: number, examId: number): Promise<ClassResultsDTO> => {
    const response = await api.get<ClassResultsDTO>(`/results/class/${classId}/exam/${examId}`);
    return response.data;
  },

  /**
   * Get all exam results for a specific student
   */
  getStudentAllResults: async (panNumber: string): Promise<StudentResultsDTO> => {
    const response = await api.get<StudentResultsDTO>(`/results/student?panNumber=${panNumber}`);
    return response.data;
  },

  /**
   * Get scores filtered by class, subject, and exam
   */
  getScoresByClassSubjectAndExam: async (
    classId: number,
    subjectId: number,
    examId: number
  ): Promise<ScoreResponseDTO[]> => {
    const response = await api.get<ScoreResponseDTO[]>(
      `/results/class/${classId}/subject/${subjectId}/exam/${examId}`
    );
    return response.data;
  },

  /**
   * Calculate grade based on percentage
   */
  calculateGrade: (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  },

  /**
   * Format percentage to 2 decimal places
   */
  formatPercentage: (percentage: number): string => {
    return percentage.toFixed(2) + '%';
  }
};

export default resultService;
