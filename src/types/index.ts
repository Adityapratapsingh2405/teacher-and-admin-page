// Common types and enums
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'UNPAID';
export type FeeCatalogStatus = 'UP_TO_DATE' | 'PENDING' | 'OVERDUE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'NON_TEACHING_STAFF';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type FeeType = 'TUITION' | 'EXAM' | 'TRANSPORT' | 'LIBRARY' | 'ACTIVITY' | 'OTHER';
export type EventType = 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'HOLIDAY' | 'EXAM';
export type TCStatus = 'PENDING' | 'FORWARDED_TO_TEACHER' | 'APPROVED' | 'REJECTED';

// Authentication types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface StudentAuthRequest {
  panNumber: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// User types
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  panNumber: string;
  name: string;
  photo?: string;
  classId: number;
  className: string;
  classRollNumber: number;
  status: UserStatus;
  feeStatus: FeeStatus;
  feeCatalogStatus: FeeCatalogStatus;
  parentName: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  admissionDate: string;
  previousSchool?: string;
  sessionName: string;
  sessionId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  qualifications: string;
  contactNumber: string;
  email: string;
  salaryGrade: string;
  status: UserStatus;
  assignedClasses: ClassEntity[];
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface NonTeachingStaff {
  id: string;
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Class and Session types
export interface ClassEntity {
  id: number;
  className: string;
  section: string;
  capacity: number;
  sessionId: number;
  sessionName: string;
  classTeacherId?: string;
  classTeacherName?: string;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subject types
export interface Subject {
  id: number;
  subjectName: string;
  subjectCode: string;
  description?: string;
  classId: number;
  teacherId?: string;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
}

// Timetable types
export interface TimetableEntry {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  className: string;
}

export interface TimetableRequest {
  classId: number;
  subjectId: number;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// Attendance types
export interface AttendanceRecord {
  id: number;
  studentPan: string;
  studentName: string;
  classId: number;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceUpdate {
  studentPan: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceByClass {
  classId: number;
  className: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRecords: AttendanceRecord[];
}

// Fee types
export interface FeeStructure {
  id: number;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  description?: string;
  classId: number;
  className: string;
  sessionId: number;
  sessionName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: number;
  studentPan: string;
  feeStructureId: number;
  amount: number;
  status: FeeStatus;
  dueDate: string;
  paymentDate?: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyFee {
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paymentDate?: string;
  receiptNumber?: string;
}

export interface FeeCatalog {
  studentPan: string;
  studentName: string;
  monthlyFees: MonthlyFee[];
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface FeePaymentRequest {
  feeIds: number[];
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
}

// Exam and Score types
export interface Exam {
  id: number;
  examName: string;
  examDate: string;
  classId: number;
  className: string;
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: number;
  studentPan: string;
  studentName: string;
  examId: number;
  subjectId: number;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreRequest {
  studentPan: string;
  examId: number;
  subjectId: number;
  marksObtained: number;
  totalMarks: number;
  remarks?: string;
}

// Event and Calendar types
export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventType: EventType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventType: EventType;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transfer Certificate types
export interface TransferCertificateRequest {
  id: number;
  studentPan: string;
  studentPanNumber?: string; // Alias
  studentName: string;
  className?: string;
  sessionName?: string;
  reason: string;
  requestDate: string;
  status: TCStatus;
  adminReply?: string; // Admin's response message
  adminRemarks?: string; // Legacy field
  adminActionDate?: string;
  teacherRemarks?: string;
  forwardedToTeacher?: string;
  forwardedDate?: string;
  processedDate?: string;
  processedBy?: string;
  certificateNumber?: string;
  issueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TCRequest {
  reason: string;
  additionalDetails?: string;
  transferDate?: string;
  newSchoolName?: string;
  newSchoolAddress?: string;
}

export interface TCProcessRequest {
  action: 'APPROVE' | 'REJECT' | 'FORWARD_TO_TEACHER';
  remarks: string;
  teacherPan?: string; // Required when action is FORWARD_TO_TEACHER
}

// Request/Response types for forms
export interface StudentRegisterRequest {
  name: string;
  panNumber: string;
  parentName: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  admissionDate: string;
  previousSchool?: string;
  classId: number;
  password: string;
}

export interface StaffRegisterRequest {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  role: Role;
  designation: string;
  salaryGrade?: string;
  qualifications?: string;
}

export interface UpdateStudentInfo {
  name?: string;
  parentName?: string;
  mobileNumber?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
}

export interface UpdateStudentStatusRequest {
  studentPans: string[];
  status: UserStatus;
}

export interface UpdateUserDetails {
  name?: string;
  email?: string;
  contactNumber?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Pagination types
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Filter types
export interface StudentFilter extends PageRequest {
  name?: string;
  className?: string;
  status?: UserStatus;
  feeStatus?: FeeStatus;
  sessionId?: number;
}

export interface TeacherFilter extends PageRequest {
  name?: string;
  designation?: string;
  status?: UserStatus;
}

export interface AttendanceFilter {
  classId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

export interface FeeFilter extends PageRequest {
  studentPan?: string;
  feeType?: FeeType;
  status?: FeeStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  classId?: number;
}

// Subject-related types
export interface SubjectRequest {
  name: string;
  code: string;
  description?: string;
  credits: number;
  classId: number;
  sessionId: number;
}

export interface SubjectGrades {
  id: number;
  studentPan: string;
  subjectId: number;
  midTermMarks?: number;
  finalTermMarks?: number;
  totalMarks?: number;
  grade?: string;
  gpa?: number;
  remarks?: string;
  subject?: Subject;
  student?: Student;
}

export interface GradeUpdateRequest {
  studentPan: string;
  subjectId: number;
  midTermMarks?: number;
  finalTermMarks?: number;
  remarks?: string;
}

// Timetable-related types
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface TimetableSlot {
  period: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Timetable {
  classId: number;
  className: string;
  entries: TimetableEntry[];
  totalHours: number;
}

// Exam and Score request types
export interface ExamRequest {
  examName: string;
  examDate: string;
  classId: number;
  subjectId: number;
  totalMarks: number;
  passingMarks: number;
  duration?: number;
  instructions?: string;
}

export interface ExamResult {
  examId: number;
  studentPan: string;
  studentName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: string;
  rank?: number;
}

export interface ExamStatistics {
  examId: number;
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passedStudents: number;
  failedStudents: number;
  passPercentage: number;
}

// Event request types
export interface EventRequest {
  title: string;
  description?: string;
  eventType: EventType;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  classId?: number;
  isPublic: boolean;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  eventType?: EventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  classId?: number;
  isPublic?: boolean;
}

// Session request types
export interface SessionRequest {
  name: string;
  startYear: number;
  endYear: number;
  startDate: string;
  endDate: string;
  description?: string;
}

// Transfer Certificate types
export interface TransferCertificate {
  id: number;
  studentPan: string;
  studentName: string;
  studentClass?: string;
  requestDate: string;
  reason: string;
  status: 'PENDING_ADMIN' | 'PENDING_TEACHER' | 'APPROVED' | 'REJECTED';
  // Admin fields
  forwardedToTeacher?: string; // Teacher PEN
  forwardedByAdmin?: string; // Admin who forwarded
  forwardedDate?: string;
  adminRemarks?: string;
  // Teacher fields
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  teacherRemarks?: string;
  // Certificate fields
  certificateNumber?: string;
  issueDate?: string;
  issuedBy?: string;
  remarks?: string;
  lastUpdated: string;
}

export interface TCForwardRequest {
  requestId: number;
  teacherPan: string;
  adminRemarks?: string;
}

export interface TCApprovalRequest {
  requestId: number;
  approved: boolean;
  teacherRemarks?: string;
  rejectionReason?: string;
}

export default {};
