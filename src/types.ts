export interface UserProfile {
  uid: string;
  fullName: string;
  gender: string;
  parentName: string;
  contactNumber: string;
  email: string;
  district: string;
  college: string;
  degree: "UG" | "PG";
  department: string;
  subject: string;
  session: string;
  semester: string;
  universityRoll: string;
  internshipDomain: string;
  isPaid: boolean;
  registrationDate: string;
  learningHours: number;
  progress: number;
}

export interface PaymentRecord {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: string;
  timestamp: string;
}

export interface AssignmentSubmission {
  id?: string;
  userId: string;
  domain: string;
  title: string;
  submissionUrl: string;
  status: "Submitted" | "Graded";
  score?: number;
  feedback?: string;
  submittedAt: string;
}
