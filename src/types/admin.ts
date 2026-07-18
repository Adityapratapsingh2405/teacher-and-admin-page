export interface Student {
  id: string;
  name: string;
  section: string;
  classRollNumber: number;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  feeStatus: 'paid' | 'pending' | 'overdue';
  feeCatalogStatus: 'up_to_date' | 'pending' | 'overdue';
  currentClass: string;
  className?: string; // Full class name like "1-A"
  classId?: number; // Class ID for direct reference
  parentName: string;
  mobileNumber: string;
  // Additional student details
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  admissionDate: string;
  previousSchool?: string;
  transport?:boolean;
}

export interface MonthlyFee {
  month: string;
  year: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'unpaid';
  paymentDate?: string;
  receiptNumber?: string;
  type?:string;
}

export interface FeeCatalog {
  studentId: string;
  monthlyFees: MonthlyFee[];
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface TeachingStaff {
  id: string;
  name: string;
  designation: string;
  salaryGrade: string;
  contactNumber: string;
  email: string;
  qualification: string;
  assignedClasses: string[];
}

export interface NonTeachingStaff {
  id: string;
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
}

export interface TransferCertificate {
  id: string;
  studentName: string;
  studentClass: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'sports' | 'cultural' | 'academic';
  description: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ClassData {
  className: string;
  section: string;
  students: Student[];
  totalStudents: number;
  feeCollectionRate: number;
} 