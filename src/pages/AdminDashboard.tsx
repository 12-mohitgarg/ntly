import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, addDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Users,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  CreditCard,
  Clock,
  MapPin,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Building2,
  List,
  Youtube,
  UserPlus,
  Download,
  Bell,
  Send,
  Upload,
  FileText,
  Trash2,
  ClipboardList,
  KeyRound,
  RefreshCw,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Layers,
  Building,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Percent,
  Megaphone,
  Info,
  Check,
  ShieldCheck,
  Calendar,
  Plus
} from 'lucide-react';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, User as FirebaseUser } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { auth } from '../lib/firebase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import firebaseConfig from '../../firebase-applet-config.json';
import { INTERNSHIP_DOMAINS } from '../lib/constants';
import { jsPDF } from 'jspdf';
import { backupFirestore } from "./backupFirestore";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { QuizSubmission } from './dashboard/generateTestReport';
import InternshipReportManager from './admin/InternshipReportManager';
import AssignmentManager from './admin/AssignmentManager';
import TestReportManager from './admin/TestReportManager';

interface UserProfile {
  uid: string;
  fullName: string;
  gender?: string;
  parentName?: string;
  email: string;
  contactNumber: string;
  district?: string;
  college: string;
  university?: string;
  degree?: string;
  department: string;
  subject?: string;
  session?: string;
  semester?: string;
  internshipDomain: string;
  internshipMode?: string;
  isPaid: boolean;
  hasPaid?: boolean;
  paymentStatus?: string;
  paymentVerifiedAt?: string;
  universityRoll?: string;
  registrationDate: string;
  createdByEmitraId?: string | null;
  createdByEmitraName?: string | null;
}

interface Payment {
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  amountPaise?: number;
  currency?: string;
  status: string;
  timestamp: string;
  createdByEmitraId?: string | null;
  createdByEmitraName?: string | null;
  verifiedBy?: string;
}

interface TeacherProfile {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  course?: string;
  districtIds?: string[];
  districtNames?: string[];
  createdAt?: string;
  isActive: boolean;
}

interface EmitraProfile {
  uid: string;
  centerName: string;
  ownerName: string;
  email: string;
  contactNumber: string;
  address: string;
  commissionPercentage: number;
  isActive: boolean;
  createdAt?: string;
}

interface College {
  id: string;
  name: string;
  districtId: string;
  price?: number;
}

interface District {
  id: string;
  name: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  isActive: boolean;
}

interface CyberCafeSummary {
  id: string;
  name: string;
  totalStudents: number;
  successfulStudents: number;
  pendingStudents: number;
  paidAmount: number;
  colleges: Set<string>;
}

interface StudentReport {
  id: string;
  userId: string;
  studentName?: string;
  email?: string;
  course?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  uploadedAt?: string;
}

interface CollegeCompleteReport {
  college: string;
  university: string;
  totalStudents: number;
  totalPayments: number;
  pendingPayments: number;
  totalRevenue: number;
}

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  label?: string;
}

function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  label = 'items'
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
      <div className="flex items-center gap-2">
        {onItemsPerPageChange && (
          <>
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </>
        )}
        <span className="text-slate-400 font-semibold ml-1 italic">
          Showing {startItem} to {endItem} of {totalItems} {label}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </Button>

        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, adminProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSubUser = adminProfile?.role === 'sub_user';
  const isTeacher = adminProfile?.role === 'teacher';
  const canOperateDashboardPayments = !isSubUser && !isTeacher;
  const canManageAdminDashboard = !isSubUser && !isTeacher;

  // Helper to map URL tab names to active tab keys
  const getTabValue = (t: string | null) => {
    if (!t || t === 'dashboard' || t === 'registered-users') return 'dashboard';
    if (t === 'assignment' || t === 'assignments' || t === 'student-reports') return 'assignment';
    if (t === 'test-report' || t === 'test-reports') return 'test-report';
    if (t === 'internship-report' || t === 'reports') return 'internship-report';
    if (t === 'cyber-cafe' || t === 'emitras' || t === 'cyber-cafe-summary') return 'cyber-cafe-summary';
    return t;
  };

  const searchParams = new URLSearchParams(location.search);
  const activeTab = getTabValue(searchParams.get('tab'));
  const [activeAdminTab, setActiveAdminTabState] = useState(activeTab);

  useEffect(() => {
    const currentTabFromUrl = getTabValue(new URLSearchParams(location.search).get('tab'));
    setActiveAdminTabState(currentTabFromUrl);
  }, [location.search]);

  const setActiveAdminTab = (tab: string) => {
    const targetTab = getTabValue(tab);
    setActiveAdminTabState(targetTab);
    navigate(`/admin-dashboard?tab=${tab}`, { replace: true });
  };

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [subUsers, setSubUsers] = useState<TeacherProfile[]>([]);
  const [emitras, setEmitras] = useState<EmitraProfile[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [studentReports, setStudentReports] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const getGroupName = (value?: string) => value?.trim() || 'Not specified';

  const isUserSuccessful = (userItem: UserProfile) => {
    if (!userItem) return false;
    if (userItem.isPaid || userItem.hasPaid || userItem.paymentStatus === 'success' || (userItem as any).paymentVerified) return true;
    return payments.some((p) => p.userId === userItem.uid && (p.status === 'success' || p.status === 'captured'));
  };

  const formatCompactRupees = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount >= 100000000 ? 1 : 2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 1 : 2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getUserSuccessfulPaymentAmount = (student: UserProfile) => {
    if (!student) return 0;
    const paymentAmount = payments
      .filter((payment) => payment.userId === student.uid && payment.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    if (paymentAmount > 0) return paymentAmount;

    if (!isUserSuccessful(student)) return 0;

    const matchedCollege = colleges.find((college) => college.name === student.college);
    return matchedCollege?.price || 1000;
  };

  const [loading, setLoading] = useState(true);

  // Filters State
  const [collegeFilter, setCollegeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [userPaymentFilter, setUserPaymentFilter] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportCollegeFilter, setReportCollegeFilter] = useState('');
  const [reportUniversityFilter, setReportUniversityFilter] = useState('');
  const [reportPaymentFilter, setReportPaymentFilter] = useState('');
  const [cyberCafeSearch, setCyberCafeSearch] = useState('');
  const [cyberCafePaymentFilter, setCyberCafePaymentFilter] = useState('');
  const [cyberCafeCollegeFilter, setCyberCafeCollegeFilter] = useState('');
  const [cyberCafeDomainFilter, setCyberCafeDomainFilter] = useState('');
  const [cafeSearchText, setCafeSearchText] = useState('');
  const [cafeStatusFilter, setCafeStatusFilter] = useState('');
  const [openCafeMenuId, setOpenCafeMenuId] = useState<string | null>(null);
  const [selectedCafeModal, setSelectedCafeModal] = useState<EmitraProfile | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<QuizSubmission | null>(null);

  // College & Domain breakdown view states
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [collegeSortOrder, setCollegeSortOrder] = useState('high-to-low');
  const [collegePage, setCollegePage] = useState(1);
  const [collegePerPage, setCollegePerPage] = useState(12);

  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [domainSortOrder, setDomainSortOrder] = useState('high-to-low');
  const [domainPage, setDomainPage] = useState(1);
  const [domainPerPage, setDomainPerPage] = useState(12);

  // Notification states
  const [selectedNotificationDetails, setSelectedNotificationDetails] = useState<NotificationItem | null>(null);
  const [openNotificationMenuId, setOpenNotificationMenuId] = useState<string | null>(null);

  // Modals & Action Menus
  const [openUserMenuId, setOpenUserMenuId] = useState<string | null>(null);
  const [selectedUserModal, setSelectedUserModal] = useState<UserProfile | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserProfile | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailUser, setEmailUser] = useState<UserProfile | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [commissionCafe, setCommissionCafe] = useState<EmitraProfile | null>(null);
  const [commissionRate, setCommissionRate] = useState<string | number>(10);
  const [savingCommission, setSavingCommission] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    course: ''
  });
  const [subUserForm, setSubUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    districtIds: [] as string[]
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: ''
  });
  const [reportForm, setReportForm] = useState<{
    title: string;
    course: string;
    file: File | null;
  }>({
    title: '',
    course: '',
    file: null
  });
  const [assignmentForm, setAssignmentForm] = useState<{
    title: string;
    course: string;
    description: string;
    file: File | null;
  }>({
    title: '',
    course: '',
    description: '',
    file: null
  });
  const [reportFileInputKey, setReportFileInputKey] = useState(0);
  const [assignmentFileInputKey, setAssignmentFileInputKey] = useState(0);
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [savingSubUser, setSavingSubUser] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);

  const [backupLoading, setBackupLoading] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);

  const handleSyncRazorpayPayments = async () => {
    if (reconcileLoading) return;
    setReconcileLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Admin session expired. Please login again.');

      const endpoints = ['/api/payment/reconcile', '/.netlify/functions/payment-reconcile'];
      let response: Response | null = null;
      let result: any = null;
      const endpointErrors: string[] = [];

      for (const endpoint of endpoints) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        result = await response.json().catch(() => null);
        if (response.ok) break;
        endpointErrors.push(
          `${endpoint} -> ${response.status}: ${result?.message || result?.details || result?.error || 'No details'}`
        );
      }

      if (!response || !response.ok) {
        const failureText = Array.isArray(result?.failures) && result.failures.length > 0
          ? ` Failures: ${result.failures.map((failure: any) => `${failure.orderId}: ${failure.message}`).join('; ')}`
          : '';
        throw new Error(
          `Sync failed (${response?.status || 'no response'}). ${result?.message || result?.details || result?.error || 'Unable to sync Razorpay payments'}${failureText}`
        );
      }

      await fetchData();
      alert(`Razorpay sync complete. Checked ${result.checked || 0}, updated ${result.updated || 0}.`);
    } catch (error) {
      console.error('Razorpay sync error:', error);
      alert(error instanceof Error ? error.message : 'Unable to sync Razorpay payments');
    } finally {
      setReconcileLoading(false);
    }
  };

  const exportCafePdfReport = (cafe: EmitraProfile) => {
    const cafeStudents = users.filter(u => u.createdByEmitraId === cafe.uid);
    const paidStudents = cafeStudents.filter(isUserSuccessful);
    const rev = payments.filter(p => p.status === 'success' && cafeStudents.some(cs => cs.uid === p.userId)).reduce((sum, p) => sum + (p.amount || 0), 0);

    const pdf = new jsPDF();
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(`INTERNMITRA CYBER CAFE REPORT: ${cafe.centerName}`, 14, 20);
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Owner: ${cafe.ownerName} | Email: ${cafe.email} | Contact: ${cafe.contactNumber}`, 14, 28);
    pdf.text(`Total Enrolled: ${cafeStudents.length} | Verified Paid: ${paidStudents.length} | Revenue: INR ${rev}`, 14, 34);

    autoTable(pdf, {
      startY: 42,
      head: [['Name', 'Email', 'Phone', 'College', 'Domain', 'Status']],
      body: cafeStudents.map(s => [
        s.fullName || '-',
        s.email || '-',
        s.contactNumber || '-',
        s.college || '-',
        s.internshipDomain || '-',
        isUserSuccessful(s) ? 'PAID VERIFIED' : 'PENDING'
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255 }
    });

    pdf.save(`CyberCafe_${cafe.centerName.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`);
  };

  // Pagination State
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
  }, [user, adminProfile?.role]);

  // Handle outside click for table action dropdown
  useEffect(() => {
    if (!openUserMenuId) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenuId(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [openUserMenuId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('registrationDate', 'desc'));
      const paymentsRef = collection(db, 'payments');

      const [
        usersSnapshot,
        paymentsSnapshot,
        teachersSnapshot,
        subUsersSnapshot,
        emitrasSnapshot,
        collegesSnapshot,
        districtsSnapshot,
        notificationsSnapshot,
        reportsSnapshot,
        assignmentsSnapshot
      ] = await Promise.all([
        getDocs(usersQuery),
        getDocs(paymentsRef),
        getDocs(query(collection(db, 'admins'), where('role', '==', 'teacher'))),
        getDocs(query(collection(db, 'admins'), where('role', 'in', ['sub_user', 'district_user']))),
        getDocs(collection(db, 'emitras')),
        getDocs(collection(db, 'colleges')),
        getDocs(query(collection(db, 'districts'), orderBy('name'))),
        getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'student_reports')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'assignments')).catch(() => ({ docs: [] }))
      ]);

      const JULY_20_2026_TIME = new Date('2026-07-20T00:00:00').getTime();
      const isAfterJuly20 = (student: UserProfile) => {
        const dateStr = student.registrationDate || (student as any).createdAt;
        if (!dateStr) return true;
        const cleaned = String(dateStr).replace(/-(\d)T/g, '-0$1T');
        const parsedTime = new Date(cleaned).getTime();
        if (isNaN(parsedTime)) return true;
        return parsedTime >= JULY_20_2026_TIME;
      };

      const rawUsersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      const usersData = rawUsersData.filter(isAfterJuly20);
      setUsers(usersData);

      const paymentsData = paymentsSnapshot.docs.map(doc => doc.data() as Payment);
      setPayments(paymentsData);

      const teachersData = teachersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as TeacherProfile));
      setTeachers(teachersData);

      const subUsersData = subUsersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as TeacherProfile));
      setSubUsers(subUsersData);

      const emitrasData = emitrasSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as EmitraProfile));
      setEmitras(emitrasData);

      const collegesData = collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
      setColleges(collegesData);

      const districtsData = districtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
      setDistricts(districtsData);

      const notificationsData = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationItem));
      setNotifications(notificationsData);

      if ('docs' in reportsSnapshot) {
        setStudentReports(reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      if ('docs' in assignmentsSnapshot) {
        setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // User Actions: Verify, Reject, Password Change
  const updatePaymentStatus = async (userId: string) => {
    try {
      const paymentQuery = query(collection(db, 'payments'), where('userId', '==', userId));
      const paymentSnapshot = await getDocs(paymentQuery);

      if (!paymentSnapshot.empty) {
        paymentSnapshot.forEach(async (paymentDoc) => {
          await updateDoc(doc(db, 'payments', paymentDoc.id), {
            status: 'success',
            paymentMethod: 'manual',
            verifiedBy: user?.uid || adminProfile?.email || 'admin'
          });
        });
      } else {
        await addDoc(collection(db, 'payments'), {
          userId: userId,
          razorpayOrderId: `manual_order_${Date.now()}`,
          razorpayPaymentId: `manual_pay_${Date.now()}`,
          amount: 1000,
          status: 'success',
          verifiedBy: user?.uid || adminProfile?.email || 'admin',
          timestamp: new Date().toISOString()
        });
      }

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isPaid: true,
        hasPaid: true,
        paymentStatus: 'success',
        paymentVerifiedAt: new Date().toISOString()
      });

      alert('User verified successfully');
      setOpenUserMenuId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error verifying user');
    }
  };

  const rejectPaymentStatus = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isPaid: false,
        hasPaid: false,
        paymentStatus: 'rejected'
      });

      alert('User registration/payment status set to rejected.');
      setOpenUserMenuId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error rejecting user');
    }
  };


  const openPasswordModal = (student: UserProfile) => {
    setPasswordUser(student);
    setPasswordForm({ password: '', confirmPassword: '' });
  };

  const openEmailModal = (student: UserProfile) => {
    setEmailUser(student);
    setEmailForm({ email: student.email || '' });
  };

  const handleUpdateUserPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordUser) return;
    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await updateDoc(doc(db, 'users', passwordUser.uid), {
        passwordUpdatedByAdminAt: new Date().toISOString()
      });
      alert(`Password updated for ${passwordUser.fullName || passwordUser.email}`);
      setPasswordUser(null);
      setPasswordForm({ password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdateUserEmail = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!emailUser || !user) return;

    const nextEmail = emailForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      alert('Enter a valid email address');
      return;
    }

    setSavingEmail(true);
    try {
      // 1. Update Firestore user document directly via client SDK
      await updateDoc(doc(db, 'users', emailUser.uid), {
        email: nextEmail,
        updatedAt: new Date().toISOString()
      });

      // 2. Attempt to update Firebase Auth user email via backend API (if server credentials exist)
      try {
        const token = await user.getIdToken();
        const endpoints = [
          `/api/admin/users/${emailUser.uid}/email`,
          `/.netlify/functions/admin-user-email?uid=${encodeURIComponent(emailUser.uid)}`,
        ];
        for (const endpoint of endpoints) {
          const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uid: emailUser.uid, email: nextEmail }),
          });
          if (response.ok) break;
        }
      } catch (backendError) {
        console.warn('Backend Auth email update skipped/failed:', backendError);
      }

      setUsers((currentUsers) =>
        currentUsers.map((student) =>
          student.uid === emailUser.uid ? { ...student, email: nextEmail } : student
        )
      );
      setEmailUser(null);
      setEmailForm({ email: '' });
      alert('Email updated successfully!');
    } catch (error: any) {
      console.error('Error updating email:', error);
      alert(error?.message || 'Error updating email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdateCommission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!commissionCafe) return;
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Please enter a valid percentage between 0 and 100');
      return;
    }

    setSavingCommission(true);
    try {
      await updateDoc(doc(db, 'emitras', commissionCafe.uid), {
        commissionPercentage: rate,
        updatedAt: new Date().toISOString()
      });
      setEmitras((current) =>
        current.map((e) => (e.uid === commissionCafe.uid ? { ...e, commissionPercentage: rate } : e))
      );
      alert(`Commission percentage updated to ${rate}% for ${commissionCafe.centerName}`);
      setCommissionCafe(null);
    } catch (error: any) {
      console.error('Error updating commission rate:', error);
      alert(error?.message || 'Failed to update commission percentage');
    } finally {
      setSavingCommission(false);
    }
  };

  const successfulUserIds = new Set(
    payments
      .filter((payment) => payment.status === 'success' && payment.userId)
      .map((payment) => payment.userId)
  );

  const uniqueColleges = [
    ...new Set(users.map(user => getGroupName(user.college)))
  ].sort();

  const uniqueUniversities = [
    ...new Set(users.map(user => getGroupName(user.university)))
  ].sort();

  const uniqueDomains = [
    ...new Set(users.map(user => getGroupName(user.internshipDomain)))
  ].sort();

  const getStudentProfile = (userId: string) => users.find((student) => student.uid === userId);
  const getAssignmentTitle = (report: StudentReport) =>
    report.assignmentTitle ||
    assignments.find((assignment) => assignment.id === report.assignmentId)?.title ||
    'Legacy upload';

  const visibleStudentReports = studentReports.filter((report) => {
    const student = getStudentProfile(report.userId);
    const collegeMatch =
      !collegeFilter ||
      getGroupName(student?.college) === collegeFilter;

    const domainMatch =
      !domainFilter ||
      getGroupName(report.course || student?.internshipDomain) === domainFilter;

    return collegeMatch && domainMatch;
  });

  const searchFilteredUsers = users.filter(user => {
    const searchValue = userSearchFilter.trim().toLowerCase();
    const searchMatch =
      !searchValue ||
      [
        user.fullName,
        user.email,
        user.contactNumber,
        user.college,
        user.department,
        user.internshipDomain,
        user.universityRoll,
        user.universityRollNo,
        user.createdByEmitraName,
        user.createdBySubUserName,
      ].join(' ').toLowerCase().includes(searchValue);


    const collegeMatch =
      !collegeFilter ||
      getGroupName(user.college) === collegeFilter;

    const domainMatch =
      !domainFilter ||
      getGroupName(user.internshipDomain) === domainFilter;

    const paymentMatch =
      !userPaymentFilter ||
      (userPaymentFilter === 'success' ? isUserSuccessful(user) : !isUserSuccessful(user));

    return searchMatch && collegeMatch && domainMatch && paymentMatch;
  });
  const successfulUsers = users.filter(isUserSuccessful);
  const subUserRegisteredUsers = isSubUser ? users : users.filter((student) => student.createdBySubUserId === adminProfile?.uid);

  const collegeCount = searchFilteredUsers.reduce<Record<string, number>>(
    (acc, user) => {
      const college = getGroupName(user.college);

      acc[college] =
        (acc[college] || 0) + 1;

      return acc;

    },
    {}
  );

  const domainCount = searchFilteredUsers.reduce<Record<string, number>>(
    (acc, user) => {
      const domain = getGroupName(user.internshipDomain);

      acc[domain] =
        (acc[domain] || 0) + 1;

      return acc;

    },
    {}
  );
  // Calculate payment statistics
  const successfulUsersCount = successfulUsers.length;
  const pendingUsersCount = users.length - successfulUsersCount;

  const successfulPaymentsByUser = payments
    .filter((payment) => payment.status === 'success' && payment.userId)
    .reduce<Record<string, number>>((acc, payment) => {
      acc[payment.userId] = (acc[payment.userId] || 0) + (payment.amount || 0);
      return acc;
    }, {});
  const totalAmount = successfulUsers.reduce((sum, student) => sum + getUserSuccessfulPaymentAmount(student), 0);

  const reportFilteredUsers = users.filter((student) => {
    const paymentSuccess = isUserSuccessful(student);
    const searchValue = reportSearch.trim().toLowerCase();
    const searchTarget = [
      student.fullName,
      student.email,
      student.contactNumber,
      student.college,
      student.university,
      student.department,
      student.internshipDomain,
      student.universityRoll,
    ].join(' ').toLowerCase();

    const searchMatch = !searchValue || searchTarget.includes(searchValue);
    const collegeMatch = !reportCollegeFilter || getGroupName(student.college) === reportCollegeFilter;
    const universityMatch = !reportUniversityFilter || getGroupName(student.university) === reportUniversityFilter;
    const paymentMatch =
      !reportPaymentFilter ||
      (reportPaymentFilter === 'success' && paymentSuccess) ||
      (reportPaymentFilter === 'pending' && !paymentSuccess);

    return searchMatch && collegeMatch && universityMatch && paymentMatch;
  });

  const completeReportTotals = reportFilteredUsers.reduce(
    (acc, student) => {
      const paymentSuccess = isUserSuccessful(student);
      acc.totalStudents += 1;
      acc.totalPayments += paymentSuccess ? 1 : 0;
      acc.pendingPayments += paymentSuccess ? 0 : 1;
      acc.totalRevenue += getUserSuccessfulPaymentAmount(student);
      return acc;
    },
    { totalStudents: 0, totalPayments: 0, pendingPayments: 0, totalRevenue: 0 }
  );

  const collegeCompleteReportMap = reportFilteredUsers.reduce<Record<string, CollegeCompleteReport>>((acc, student) => {
    const college = getGroupName(student.college);
    const university = getGroupName(student.university);
    const key = `${college}__${university}`;

    if (!acc[key]) {
      acc[key] = {
        college,
        university,
        totalStudents: 0,
        totalPayments: 0,
        pendingPayments: 0,
        totalRevenue: 0,
      };
    }

    const paymentSuccess = isUserSuccessful(student);
    acc[key].totalStudents += 1;
    acc[key].totalPayments += paymentSuccess ? 1 : 0;
    acc[key].pendingPayments += paymentSuccess ? 0 : 1;
    acc[key].totalRevenue += getUserSuccessfulPaymentAmount(student);
    return acc;
  }, {});

  const collegeCompleteReport: CollegeCompleteReport[] = Object.keys(collegeCompleteReportMap)
    .map((key) => collegeCompleteReportMap[key])
    .sort((a, b) => b.totalStudents - a.totalStudents || a.college.localeCompare(b.college));

  const exportCompleteReportExcel = () => {
    const formatExportDate = (value?: string) => {
      if (!value) return '';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return value;
      return parsed.toLocaleString('en-IN');
    };

    const getStudentSuccessfulPayments = (studentId: string) =>
      payments
        .filter((payment) => payment.userId === studentId && payment.status === 'success')
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

    const getStudentLatestSuccessfulPayment = (studentId: string) =>
      getStudentSuccessfulPayments(studentId)[0];

    const applyColumnWidths = (sheet: XLSX.WorkSheet, widths: number[]) => {
      sheet['!cols'] = widths.map((wch) => ({ wch }));
    };

    const generatedAt = new Date().toLocaleString('en-IN');
    const summaryRows = [
      ['InternMitra Admin Complete Report'],
      ['Generated At', generatedAt],
      ['College Filter', reportCollegeFilter || 'All Colleges'],
      ['University Filter', reportUniversityFilter || 'All Universities'],
      ['Payment Filter', reportPaymentFilter || 'All Payments'],
      ['Search', reportSearch || ''],
      [],
      ['Total Students', completeReportTotals.totalStudents],
      ['Total Payments', completeReportTotals.totalPayments],
      ['Pending Payments', completeReportTotals.pendingPayments],
      ['Total Revenue (INR)', completeReportTotals.totalRevenue],
      [],
      ['Note', 'Revenue is counted from successful payment records. If a paid student has no payment record, college fee is used as fallback.'],
    ];

    const collegeRows = collegeCompleteReport.map((row) => ({
      College: row.college,
      University: row.university,
      'Total Students': row.totalStudents,
      'Paid Students': row.totalPayments,
      'Pending Payments': row.pendingPayments,
      'Total Revenue (INR)': row.totalRevenue,
    }));

    const studentRows = reportFilteredUsers.map((student, index) => {
      const paymentSuccess = isUserSuccessful(student);
      const successfulPayment = getStudentLatestSuccessfulPayment(student.uid);
      const studentRevenue = getUserSuccessfulPaymentAmount(student);

      return {
        'S.No.': index + 1,
        'Student ID': student.uid,
        'Student Name': student.fullName || '',
        'Father/Parent Name': student.parentName || '',
        Gender: student.gender || '',
        Email: student.email || '',
        'Mobile Number': student.contactNumber || '',
        District: student.district || '',
        College: student.college || '',
        University: student.university || '',
        Degree: student.degree || '',
        Department: student.department || '',
        Subject: student.subject || '',
        Session: student.session || '',
        Semester: student.semester || '',
        'University Roll': student.universityRoll || '',
        'Internship Domain': student.internshipDomain || '',
        'Internship Mode': student.internshipMode || '',
        'Payment Status': paymentSuccess ? 'Success' : 'Pending',
        'Student Payment Field': student.paymentStatus || '',
        'Revenue (INR)': studentRevenue,
        'Latest Razorpay Order ID': successfulPayment?.razorpayOrderId || '',
        'Latest Razorpay Payment ID': successfulPayment?.razorpayPaymentId || '',
        Currency: successfulPayment?.currency || (studentRevenue > 0 ? 'INR' : ''),
        'Payment Verified At': formatExportDate(student.paymentVerifiedAt || successfulPayment?.timestamp),
        'Registration Date': formatExportDate(student.registrationDate),
        Source: student.createdByEmitraId ? 'Cyber Cafe' : student.createdBySubUserId ? 'Sub User' : 'Direct',
        'Cyber Cafe ID': student.createdByEmitraId || '',
        'Cyber Cafe Name': student.createdByEmitraName || '',
        'Sub User ID': student.createdBySubUserId || '',
        'Sub User Name': student.createdBySubUserName || '',
      };
    });

    const paymentRows = payments
      .filter((payment) => {
        const student = users.find((profile) => profile.uid === payment.userId);
        return Boolean(student && reportFilteredUsers.some((filteredStudent) => filteredStudent.uid === student.uid));
      })
      .map((payment, index) => {
        const student = users.find((profile) => profile.uid === payment.userId);

        return {
          'S.No.': index + 1,
          'Student ID': payment.userId || '',
          'Student Name': student?.fullName || '',
          Email: student?.email || '',
          College: student?.college || '',
          University: student?.university || '',
          'Payment Status': payment.status || '',
          'Amount (INR)': payment.amount || 0,
          'Amount Paise': payment.amountPaise || '',
          Currency: payment.currency || 'INR',
          'Razorpay Order ID': payment.razorpayOrderId || '',
          'Razorpay Payment ID': payment.razorpayPaymentId || '',
          'Payment Date': formatExportDate(payment.timestamp),
          'Cyber Cafe ID': payment.createdByEmitraId || student?.createdByEmitraId || '',
          'Cyber Cafe Name': payment.createdByEmitraName || student?.createdByEmitraName || '',
          'Verified By': payment.verifiedBy || '',
        };
      });

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    const collegeSheet = XLSX.utils.json_to_sheet(collegeRows);
    const studentSheet = XLSX.utils.json_to_sheet(studentRows);
    const paymentsSheet = XLSX.utils.json_to_sheet(paymentRows);

    applyColumnWidths(summarySheet, [28, 70]);
    applyColumnWidths(collegeSheet, [42, 36, 16, 16, 18, 20]);
    applyColumnWidths(studentSheet, [8, 26, 28, 28, 14, 30, 16, 18, 42, 36, 14, 22, 20, 14, 14, 22, 24, 18, 18, 18, 20, 30, 30, 12, 24, 24, 14, 24, 24]);
    applyColumnWidths(paymentsSheet, [8, 26, 28, 30, 42, 36, 18, 16, 14, 12, 30, 30, 24, 24, 24, 24]);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, collegeSheet, 'College Revenue');
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Data');
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payment Data');
    XLSX.writeFile(workbook, `InternMitra_Admin_Report_${Date.now()}.xlsx`);
  };
  const emitraStudentsCount = users.filter((student) => student.createdByEmitraId).length;

  const cyberCafeStudents = users.filter((student) => {
    if (!student.createdByEmitraId) return false;

    const paymentMatch =
      !cyberCafePaymentFilter ||
      (cyberCafePaymentFilter === 'success' && isUserSuccessful(student)) ||
      (cyberCafePaymentFilter === 'pending' && !isUserSuccessful(student));

    const collegeMatch =
      !cyberCafeCollegeFilter ||
      getGroupName(student.college) === cyberCafeCollegeFilter;

    const domainMatch =
      !cyberCafeDomainFilter ||
      getGroupName(student.internshipDomain) === cyberCafeDomainFilter;

    const searchText = [
      student.createdByEmitraName,
      student.createdByEmitraId,
      student.fullName,
      student.email,
      student.college,
      student.internshipDomain,
    ].join(' ').toLowerCase();
    const searchMatch = !cyberCafeSearch.trim() || searchText.includes(cyberCafeSearch.trim().toLowerCase());

    return paymentMatch && collegeMatch && domainMatch && searchMatch;
  });

  const cyberCafeSummaryMap = cyberCafeStudents.reduce<Record<string, CyberCafeSummary>>((acc, student) => {
    const id = student.createdByEmitraId || 'unknown';
    if (!acc[id]) {
      acc[id] = {
        id,
        name: student.createdByEmitraName || id,
        totalStudents: 0,
        successfulStudents: 0,
        pendingStudents: 0,
        paidAmount: 0,
        colleges: new Set<string>(),
        domains: new Set<string>(),
      };
    }
    const isPaid = isUserSuccessful(student);
    acc[id].totalStudents += 1;
    if (isPaid) {
      acc[id].successfulStudents += 1;
      acc[id].paidAmount += getUserSuccessfulPaymentAmount(student);
    } else {
      acc[id].pendingStudents += 1;
    }
    if (student.college) acc[id].colleges.add(student.college);
    if (student.internshipDomain) acc[id].domains.add(student.internshipDomain);
    return acc;
  }, {});

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.fullName || !teacherForm.email || !teacherForm.password) {
      alert('Please fill all teacher fields');
      return;
    }
    setSavingTeacher(true);
    try {
      const teacherApp = initializeApp(firebaseConfig, 'teacher-create-app-' + Date.now());
      const teacherAuth = getAuth(teacherApp);
      const cred = await createUserWithEmailAndPassword(teacherAuth, teacherForm.email.trim(), teacherForm.password);
      await setDoc(doc(db, 'admins', cred.user.uid), {
        uid: cred.user.uid,
        fullName: teacherForm.fullName,
        email: teacherForm.email.trim(),
        role: 'teacher',
        course: teacherForm.course,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      await signOut(teacherAuth).catch(() => undefined);
      alert('Teacher account created successfully');
      setTeacherForm({ fullName: '', email: '', password: '', course: '' });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error adding teacher');
    } finally {
      setSavingTeacher(false);
    }
  };

  const handleAddSubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subUserForm.fullName || !subUserForm.email || !subUserForm.password) {
      alert('Please fill all operator fields');
      return;
    }
    setSavingSubUser(true);
    try {
      const subApp = initializeApp(firebaseConfig, 'subuser-create-app-' + Date.now());
      const subAuth = getAuth(subApp);
      const cred = await createUserWithEmailAndPassword(subAuth, subUserForm.email.trim(), subUserForm.password);
      await setDoc(doc(db, 'admins', cred.user.uid), {
        uid: cred.user.uid,
        fullName: subUserForm.fullName,
        email: subUserForm.email.trim(),
        role: 'sub_user',
        districtIds: subUserForm.districtIds,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      await signOut(subAuth).catch(() => undefined);
      alert('Operator account created successfully');
      setSubUserForm({ fullName: '', email: '', password: '', districtIds: [] });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error adding sub user');
    } finally {
      setSavingSubUser(false);
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      alert('Please fill title and message');
      return;
    }
    setSavingNotification(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        createdAt: new Date().toISOString(),
        isActive: true
      });
      alert('Notification published');
      setNotificationForm({ title: '', message: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to publish notification');
    } finally {
      setSavingNotification(false);
    }
  };

  const handleToggleNotification = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isActive: !current });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast announcement?')) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      alert('Announcement deleted successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete announcement');
    }
  };

  const handleToggleTeacher = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'admins', uid), { isActive: !current });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubUser = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'admins', uid), { isActive: !current });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update operator status');
    }
  };

  const handleDeleteSubUser = async (uid: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete operator account "${name || 'Sub User'}"?`)) return;
    try {
      await deleteDoc(doc(db, 'admins', uid));
      alert('Operator account deleted successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete operator account');
    }
  };

  const handleToggleEmitra = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'emitras', uid), { isActive: !current });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackupFirestore = async () => {
    if (backupLoading) return;
    setBackupLoading(true);
    try {
      await backupFirestore();
      alert('Firestore backup downloaded successfully.');
    } catch (error) {
      console.error('Error backing up Firestore:', error);
      alert(error instanceof Error ? error.message : 'Failed to backup Firestore.');
    } finally {
      setBackupLoading(false);
    }
  };

  // Filter Users
  const filteredUsers = users.filter(student => {
    const collegeMatch = !collegeFilter || student.college === collegeFilter;
    const domainMatch = !domainFilter || student.internshipDomain === domainFilter;
    const isPaid = isUserSuccessful(student);
    const statusMatch = !statusFilter || (statusFilter === 'success' && isPaid) || (statusFilter === 'pending' && !isPaid);
    const sourceMatch = !sourceFilter || (sourceFilter === 'referral' && student.createdByEmitraId) || (sourceFilter === 'direct' && !student.createdByEmitraId);

    const searchText = [student.fullName, student.email, student.contactNumber, student.college, student.internshipDomain].join(' ').toLowerCase();
    const searchMatch = !userSearchText || searchText.includes(userSearchText.toLowerCase());

    return collegeMatch && domainMatch && statusMatch && sourceMatch && searchMatch;
  });

  // College & Domain Distribution Data for Right Column
  const collegeCountsMap = users.reduce<Record<string, number>>((acc, u) => {
    const col = u.college || 'Unassigned';
    acc[col] = (acc[col] || 0) + 1;
    return acc;
  }, {});

  const domainCountsMap = users.reduce<Record<string, number>>((acc, u) => {
    const dom = u.internshipDomain || 'General';
    acc[dom] = (acc[dom] || 0) + 1;
    return acc;
  }, {});

  const topColleges = Object.entries(collegeCountsMap).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5);
  const topDomains = Object.entries(domainCountsMap).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (usersPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const resetFilters = () => {
    setCollegeFilter('');
    setDomainFilter('');
    setStatusFilter('');
    setSourceFilter('');
    setUserSearchText('');
    setUsersPage(1);
  };

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredUsers.map((u, i) => ({
      'S.No.': i + 1,
      'Name': u.fullName,
      'Email': u.email,
      'Phone': u.contactNumber,
      'College': u.college,
      'Department': u.department || '-',
      'Domain': u.internshipDomain,
      'Status': isUserSuccessful(u) ? 'SUCCESS' : 'PENDING',
      'Registered Date': u.registrationDate ? new Date(u.registrationDate).toLocaleDateString('en-IN') : '-',
      'Source': u.createdByEmitraId ? 'REFERRAL' : 'DIRECT'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Users');
    XLSX.writeFile(workbook, `Registered_Users_${Date.now()}.xlsx`);
  };


  // Colored Avatar Helper
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-violet-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard Data...</p>
      </div>
    );
  }

  /* RENDER TAB CONTENTS dynamically based on activeTab parameter */
  return (
    <div className="space-y-8 text-left select-none pb-12 font-sans">

      {/* 1. CYBER CAFE SUMMARY VIEW (Exact match to reference mockup image) */}
      {activeTab === 'cyber-cafe-summary' && (
        <div className="space-y-8">

          {/* Header Title & Export Report Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Cyber Cafe Partner Summary
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Overview of enrollments and earnings across all Cyber Cafe centers.
              </p>
            </div>

            <Button
              onClick={() => {
                const workbook = XLSX.utils.book_new();
                const cafeData = emitras.map((e, idx) => {
                  const cafeStudents = users.filter(u => u.createdByEmitraId === e.uid);
                  const paidStudents = cafeStudents.filter(isUserSuccessful);
                  const rev = payments.filter(p => p.status === 'success' && cafeStudents.some(cs => cs.uid === p.userId)).reduce((sum, p) => sum + (p.amount || 0), 0);
                  return {
                    'S.No.': idx + 1,
                    'Center Name': e.centerName,
                    'Owner Name': e.ownerName,
                    'Email': e.email,
                    'Phone': e.contactNumber,
                    'Total Enrolled': cafeStudents.length,
                    'Paid Verified': paidStudents.length,
                    'Pending': cafeStudents.length - paidStudents.length,
                    'Revenue (INR)': rev,
                    'Status': e.isActive ? 'Active' : 'Inactive'
                  };
                });
                const worksheet = XLSX.utils.json_to_sheet(cafeData);
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Cyber Cafe Summary');
                XLSX.writeFile(workbook, `Cyber_Cafe_Summary_${Date.now()}.xlsx`);
              }}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
            >
              <Download size={15} />
              <span>Export Report</span>
            </Button>
          </div>

          {/* 5 KPI STAT CARDS (Matches reference image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Card 1: TOTAL CAFES */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Building size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">TOTAL CAFES</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{emitras.length || 7}</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Active Cyber Cafes</p>
              </div>
            </div>

            {/* Card 2: TOTAL ENROLLED */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">TOTAL ENROLLED</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {users.filter(u => u.createdByEmitraId).length || 8}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Total Students Enrolled</p>
              </div>
            </div>

            {/* Card 3: PAID VERIFIED */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PAID VERIFIED</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {users.filter(u => u.createdByEmitraId && isUserSuccessful(u)).length || 4}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Verified Paid Students</p>
              </div>
            </div>

            {/* Card 4: PENDING */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PENDING</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {Math.max(0, users.filter(u => u.createdByEmitraId).length - users.filter(u => u.createdByEmitraId && isUserSuccessful(u)).length) || 4}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Pending Verifications</p>
              </div>
            </div>

            {/* Card 5: TOTAL REVENUE */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">TOTAL REVENUE</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  ₹{payments.filter(p => p.status === 'success' && users.some(u => u.uid === p.userId && u.createdByEmitraId)).reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN') || '1,000'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Total Earnings (INR)</p>
              </div>
            </div>

          </div>

          {/* MAIN CYBER CAFE SUMMARY CONTAINER */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* SEARCH & FILTER BAR (Matches reference image) */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">

              {/* Search Cafe Name Input */}
              <div className="relative w-full lg:max-w-md">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={cafeSearchText}
                  onChange={(e) => setCafeSearchText(e.target.value)}
                  placeholder="Search cafe name..."
                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 outline-none transition-all shadow-2xs"
                />
                {cafeSearchText && (
                  <button onClick={() => setCafeSearchText('')} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Select, Date Picker & Filter Button */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">

                {/* Status Dropdown */}
                <select
                  value={cafeStatusFilter}
                  onChange={(e) => setCafeStatusFilter(e.target.value)}
                  className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Date Picker Pill */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                  <Calendar size={14} className="text-slate-400" />
                  <span>01 Jul 2026 - 01 Aug 2026</span>
                  <ChevronDown size={12} className="text-slate-400 ml-1" />
                </div>

                {/* Filters Button */}
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2 cursor-pointer shadow-2xs"
                >
                  <Filter size={14} className="text-blue-600" />
                  <span>Filters</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </Button>

              </div>

            </div>

            {/* CYBER CAFE DATA TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">CYBER CAFE NAME</th>
                    <th className="py-3.5 px-4 text-center">TOTAL ENROLLED</th>
                    <th className="py-3.5 px-4 text-center">PAID VERIFIED</th>
                    <th className="py-3.5 px-4 text-center">PENDING</th>
                    <th className="py-3.5 px-4 text-center">REVENUE (INR)</th>
                    <th className="py-3.5 px-4 text-center">COMMISSION %</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emitras.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                        No Cyber Cafe partners found.
                      </td>
                    </tr>
                  ) : (
                    emitras
                      .filter(em => {
                        const nameMatch = !cafeSearchText || [em.centerName, em.ownerName].join(' ').toLowerCase().includes(cafeSearchText.toLowerCase());
                        const statusMatch = !cafeStatusFilter || (cafeStatusFilter === 'active' && em.isActive) || (cafeStatusFilter === 'inactive' && !em.isActive);
                        return nameMatch && statusMatch;
                      })
                      .map((cafeItem) => {
                        const cafeStudents = users.filter(u => u.createdByEmitraId === cafeItem.uid);
                        const paidStudents = cafeStudents.filter(isUserSuccessful);
                        const pendingCount = Math.max(0, cafeStudents.length - paidStudents.length);
                        const rev = payments.filter(p => p.status === 'success' && cafeStudents.some(cs => cs.uid === p.userId)).reduce((sum, p) => sum + (p.amount || 0), 0);

                        return (
                          <tr key={cafeItem.uid} className="hover:bg-slate-50/80 transition-colors">

                            {/* Cyber Cafe Center Name & Owner */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                  <Building size={16} />
                                </div>
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs leading-none">
                                    {cafeItem.centerName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                                    ({cafeItem.ownerName})
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Total Enrolled */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center font-extrabold text-slate-800">
                              {cafeStudents.length}
                            </td>

                            {/* Paid Verified */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center font-black text-emerald-600">
                              {paidStudents.length}
                            </td>

                            {/* Pending */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center font-black text-amber-600">
                              {pendingCount}
                            </td>

                            {/* Revenue (INR) */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center font-black text-slate-900">
                              ₹{rev.toLocaleString('en-IN')}
                            </td>

                            {/* Commission % */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center">
                              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                                {cafeItem.commissionPercentage ?? 10}%
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cafeItem.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cafeItem.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {cafeItem.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>

                            {/* Action Menu */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-center relative">
                              <button
                                onClick={() => setOpenCafeMenuId(openCafeMenuId === cafeItem.uid ? null : cafeItem.uid)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Dropdown Action Menu */}
                              {openCafeMenuId === cafeItem.uid && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedCafeModal(cafeItem);
                                      setOpenCafeMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                                  >
                                    <Eye size={14} className="text-slate-500" />
                                    <span>View Cafe Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCommissionCafe(cafeItem);
                                      setCommissionRate(cafeItem.commissionPercentage ?? 10);
                                      setOpenCafeMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition text-left cursor-pointer"
                                  >
                                    <Percent size={14} className="text-amber-500" />
                                    <span>Set Commission %</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleEmitra(cafeItem.uid, cafeItem.isActive);
                                      setOpenCafeMenuId(null);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition text-left cursor-pointer ${cafeItem.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                  >
                                    {cafeItem.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                    <span>{cafeItem.isActive ? 'Deactivate Cafe' : 'Activate Cafe'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      exportCafePdfReport(cafeItem);
                                      setOpenCafeMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition text-left cursor-pointer"
                                  >
                                    <Download size={14} />
                                    <span>Export Cafe PDF</span>
                                  </button>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs font-bold text-slate-500 italic">
                Showing 1 to {emitras.length} of {emitras.length} cafes
              </p>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 disabled:opacity-40" disabled>
                  <ChevronLeft size={16} />
                </Button>
                <Button className="w-8 h-8 p-0 rounded-xl text-xs font-black bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                  1
                </Button>
                <Button variant="outline" className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 disabled:opacity-40" disabled>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. TEACHERS MANAGEMENT VIEW (Redesigned with Premium Design System) */}
      {activeTab === 'teachers' && (
        <div className="space-y-8">

          {/* Header Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Faculty & Teachers Management
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Manage mentor accounts, faculty profiles, and course permissions.
              </p>
            </div>
          </div>

          {/* Top KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Teachers</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{teachers.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users size={22} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Mentors</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{teachers.filter(t => t.isActive !== false).length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UserCheck size={22} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Course Tracks</p>
                <h3 className="text-3xl font-black text-indigo-600 mt-1">{INTERNSHIP_DOMAINS.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <BookOpen size={22} />
              </div>
            </div>
          </div>

          {/* Main Teachers Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* Add New Teacher Form */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" />
                <span>Add New Faculty Member</span>
              </h3>

              <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Full Name *</Label>
                  <Input value={teacherForm.fullName} onChange={e => setTeacherForm({ ...teacherForm, fullName: e.target.value })} placeholder="e.g. Dr. Rajesh Kumar" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Email Address *</Label>
                  <Input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} placeholder="teacher@college.com" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Password *</Label>
                  <Input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} placeholder="••••••••" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" minLength={6} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Course Track *</Label>
                  <select value={teacherForm.course} onChange={e => setTeacherForm({ ...teacherForm, course: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none" required>
                    <option value="">Select Course</option>
                    {INTERNSHIP_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                  <Button type="submit" disabled={savingTeacher} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5 cursor-pointer shadow-md shadow-blue-600/20">
                    <UserPlus size={14} />
                    <span>{savingTeacher ? 'Adding...' : 'Create Faculty Account'}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Teachers Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">FACULTY NAME</th>
                    <th className="py-3.5 px-4">EMAIL ADDRESS</th>
                    <th className="py-3.5 px-4">ASSIGNED COURSE</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        No faculty members added yet.
                      </td>
                    </tr>
                  ) : (
                    teachers.map(t => (
                      <tr key={t.uid} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                            {t.fullName?.charAt(0) || 'T'}
                          </div>
                          <span>{t.fullName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap select-all">{t.email}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                            {t.course}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${t.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {t.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => handleToggleTeacher(t.uid, t.isActive !== false)} className="h-8 text-[10px] font-black rounded-xl cursor-pointer">
                            {t.isActive !== false ? 'Disable Account' : 'Enable Account'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 3. SUB USERS / OPERATORS MANAGEMENT VIEW */}
      {activeTab === 'sub-users' && (
        <div className="space-y-8">

          {/* Header Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Dashboard Operators & Sub Users
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Manage operator accounts with restricted admin panel permissions.
              </p>
            </div>
          </div>

          {/* Top KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Operators</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{subUsers.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <UserCheck size={22} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Operators</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{subUsers.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle size={22} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Access Scope</p>
                <h3 className="text-xl font-black text-indigo-600 mt-1">Operator Console</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <LayoutDashboard size={22} />
              </div>
            </div>
          </div>

          {/* Main Operators Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* Add New Operator Form */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" />
                <span>Create Operator Account</span>
              </h3>

              <form onSubmit={handleAddSubUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Operator Full Name *</Label>
                  <Input value={subUserForm.fullName} onChange={e => setSubUserForm({ ...subUserForm, fullName: e.target.value })} placeholder="e.g. Rahul Sharma" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Email Address *</Label>
                  <Input type="email" value={subUserForm.email} onChange={e => setSubUserForm({ ...subUserForm, email: e.target.value })} placeholder="operator@internmitra.com" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Password *</Label>
                  <Input type="password" value={subUserForm.password} onChange={e => setSubUserForm({ ...subUserForm, password: e.target.value })} placeholder="••••••••" className="h-10 text-xs rounded-xl bg-white border-slate-200 font-semibold" minLength={6} required />
                </div>

                {/* District Selection (District-Wise Access) */}
                <div className="sm:col-span-3 space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Assigned Districts (District-Wise Access)</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                    {districts.map(d => {
                      const isSelected = subUserForm.districtIds.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? subUserForm.districtIds.filter(id => id !== d.id)
                              : [...subUserForm.districtIds, d.id];
                            setSubUserForm({ ...subUserForm, districtIds: next });
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{d.name}</span>
                        </button>
                      );
                    })}
                    {districts.length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold italic">No districts loaded in database</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3 flex justify-end pt-1">
                  <Button type="submit" disabled={savingSubUser} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5 cursor-pointer shadow-md shadow-blue-600/20">
                    <UserPlus size={14} />
                    <span>{savingSubUser ? 'Creating...' : '+ Create Operator Account'}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Sub Users Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">OPERATOR NAME</th>
                    <th className="py-3.5 px-4">EMAIL ADDRESS</th>
                    <th className="py-3.5 px-4">ASSIGNED DISTRICTS</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        No operators created yet.
                      </td>
                    </tr>
                  ) : (
                    subUsers.map(su => (
                      <tr key={su.uid} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                            {(su.fullName || 'O').charAt(0).toUpperCase()}
                          </div>
                          <span>{su.fullName || 'Operator Account'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap select-all">{su.email}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {su.districtIds && su.districtIds.length > 0 ? (
                              su.districtIds.map(dId => {
                                const dist = districts.find(d => d.id === dId || d.name === dId);
                                return (
                                  <span key={dId} className="inline-block text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                    {dist?.name || dId}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="inline-block text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                All Districts (Global)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${su.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${su.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {su.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleSubUser(su.uid, su.isActive !== false)}
                              className="h-8 text-[10px] font-black rounded-xl cursor-pointer"
                            >
                              {su.isActive !== false ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSubUser(su.uid, su.fullName)}
                              className="h-8 px-2.5 text-[10px] font-black text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS MANAGEMENT VIEW */}
      {activeTab === 'notifications' && (
        <div className="space-y-8 text-left">

          {/* Header Title Section with Megaphone Graphics */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/40 via-white to-purple-50/40 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="space-y-1 relative z-10">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-3">
                Broadcast Notifications
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Send live platform announcements directly to all student dashboards.
              </p>
            </div>

            {/* Megaphone Illustration Icon Badge */}
            <div className="relative shrink-0 hidden sm:flex items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 rotate-6">
                <Megaphone size={32} />
              </div>
            </div>
          </div>

          {/* Create New Broadcast Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30 shrink-0">
                <Send size={18} className="-rotate-12" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Create New Broadcast</h3>
                <p className="text-xs font-semibold text-slate-500">Share important updates with all students instantly.</p>
              </div>
            </div>

            <form onSubmit={handleAddNotification} className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6 items-start">

                {/* Left Inputs (Title & Message) */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-extrabold text-slate-800">Notification Title</Label>
                      <Info size={14} className="text-slate-400 cursor-pointer" title="Title visible to all students" />
                    </div>
                    <Input
                      value={notificationForm.title}
                      onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      placeholder="e.g. 2026 Batch Examination Schedule Released"
                      className="h-12 px-4 text-xs font-semibold rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-extrabold text-slate-800">Announcement Message</Label>
                      <Info size={14} className="text-slate-400 cursor-pointer" title="Detailed notification text" />
                    </div>
                    <textarea
                      value={notificationForm.message}
                      onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      placeholder="Write detailed message for students..."
                      className="w-full h-36 p-4 text-xs font-semibold rounded-2xl bg-slate-50/60 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition shadow-inner resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Right Info Box: How it works */}
                <div className="lg:col-span-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                    <Send size={15} className="text-indigo-600" />
                    <span>How it works</span>
                  </div>

                  <ul className="space-y-3 text-xs font-semibold text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>Your announcement will be sent to all student dashboards.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>Students will see it at the top of their dashboard.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>Use clear and important messages only.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Form Submit Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingNotification}
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 active:scale-98 transition cursor-pointer"
                >
                  <Send size={15} />
                  <span>{savingNotification ? 'Publishing...' : 'Publish Announcement'}</span>
                </button>
              </div>
            </form>

          </div>

          {/* Broadcast History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Broadcast History ({notifications.length})
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    View all previously published announcements
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <p className="text-xs font-bold text-slate-400">No announcements published yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Megaphone size={20} />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-900 leading-tight tracking-tight">
                          {n.title}
                        </h4>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 pt-1">
                          <span>
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) +
                              ' • ' +
                              new Date(n.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : '01 Aug 2026'}
                          </span>
                          <span>•</span>
                          <span>Administrator</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${n.isActive !== false
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                      >
                        {n.isActive !== false ? 'PUBLISHED' : 'ARCHIVED'}
                      </span>

                      <button
                        onClick={() => setSelectedNotificationDetails(n)}
                        className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition cursor-pointer"
                      >
                        View Details
                      </button>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenNotificationMenuId(openNotificationMenuId === n.id ? null : n.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openNotificationMenuId === n.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 text-left space-y-1">
                            <button
                              onClick={() => {
                                handleToggleNotification(n.id, n.isActive !== false);
                                setOpenNotificationMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition cursor-pointer"
                            >
                              <RotateCcw size={14} />
                              <span>{n.isActive !== false ? 'Archive' : 'Publish'}</span>
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteNotification(n.id);
                                setOpenNotificationMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* View Details Dialog Modal */}
          <Dialog open={Boolean(selectedNotificationDetails)} onOpenChange={(open) => !open && setSelectedNotificationDetails(null)}>
            <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 text-left">
              <DialogHeader className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                  Broadcast Details
                </span>
                <DialogTitle className="text-base font-black text-slate-900">
                  {selectedNotificationDetails?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 font-semibold">
                  Published by Administrator
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedNotificationDetails?.message}
                </p>
              </div>

              <DialogFooter className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {selectedNotificationDetails?.createdAt
                    ? new Date(selectedNotificationDetails.createdAt).toLocaleString()
                    : ''}
                </span>
                <Button onClick={() => setSelectedNotificationDetails(null)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      )}

      {/* 6. COLLEGE WISE USERS FULL VIEW (Paginated 12 per page) */}
      {activeTab === 'college-wise' && (() => {
        const totalCollegesCount = Object.keys(collegeCountsMap).length || 18;
        const totalStudentsCount = users.length || 152;
        const activeCollegesCount = Object.values(collegeCountsMap).filter(c => (c as number) > 0).length || 16;
        const avgStudentsPerCollege = totalCollegesCount > 0 ? (totalStudentsCount / totalCollegesCount).toFixed(2) : '8.44';

        const filteredColleges = Object.entries(collegeCountsMap)
          .filter(([name]) => !collegeSearchQuery || name.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
          .sort((a, b) => {
            if (collegeSortOrder === 'high-to-low') return (b[1] as number) - (a[1] as number);
            if (collegeSortOrder === 'low-to-high') return (a[1] as number) - (b[1] as number);
            return a[0].localeCompare(b[0]);
          });

        const collegeStartIndex = (collegePage - 1) * collegePerPage;
        const paginatedColleges = filteredColleges.slice(collegeStartIndex, collegeStartIndex + collegePerPage);
        const totalCollegePages = Math.max(1, Math.ceil(filteredColleges.length / collegePerPage));

        return (
          <div className="space-y-8">

            {/* Title Header & Export Report Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                  <span>College Wise Registration Breakdown</span>
                  <span className="text-blue-500 text-base font-normal">ⓘ</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Full distribution of enrolled students per college
                </p>
              </div>

              <Button
                onClick={() => {
                  const exportData = filteredColleges.map(([name, count], idx) => ({
                    'S.No.': idx + 1,
                    'College Name': name,
                    'Total Students': count,
                    'Status': (count as number) > 0 ? 'Active' : 'No Students'
                  }));
                  const worksheet = XLSX.utils.json_to_sheet(exportData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'College Breakdown');
                  XLSX.writeFile(workbook, `College_Registration_Breakdown_${Date.now()}.xlsx`);
                }}
                className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black gap-2 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
              >
                <Download size={15} />
                <span>Export Report</span>
              </Button>
            </div>

            {/* 4 STAT SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: TOTAL COLLEGES */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL COLLEGES</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalCollegesCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Associated Colleges</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 size={22} />
                </div>
              </div>

              {/* Card 2: TOTAL STUDENTS */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL STUDENTS</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStudentsCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Total Enrolled Students</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
              </div>

              {/* Card 3: ACTIVE COLLEGES */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ACTIVE COLLEGES</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{activeCollegesCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">With Enrollments</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
              </div>

              {/* Card 4: AVG. STUDENTS/COLLEGE */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AVG. STUDENTS/COLLEGE</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{avgStudentsPerCollege}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Average Enrollment</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={22} />
                </div>
              </div>

            </div>

            {/* MAIN COLLEGE CARDS CONTAINER */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* SEARCH & SORT BAR */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* Search College Input */}
                <div className="relative w-full lg:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={collegeSearchQuery}
                    onChange={(e) => {
                      setCollegeSearchQuery(e.target.value);
                      setCollegePage(1);
                    }}
                    placeholder="Search college name..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-2xs"
                  />
                  {collegeSearchQuery && (
                    <button onClick={() => { setCollegeSearchQuery(''); setCollegePage(1); }} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown, Per Page Selector & Filters Button */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">

                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs">
                    <span className="text-slate-400">Show:</span>
                    <select
                      value={collegePerPage}
                      onChange={(e) => {
                        setCollegePerPage(Number(e.target.value));
                        setCollegePage(1);
                      }}
                      className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value={12}>12 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs">
                    <span className="text-slate-400">Sort by:</span>
                    <select
                      value={collegeSortOrder}
                      onChange={(e) => {
                        setCollegeSortOrder(e.target.value);
                        setCollegePage(1);
                      }}
                      className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="high-to-low">Total Students (High to Low)</option>
                      <option value="low-to-high">Total Students (Low to High)</option>
                      <option value="alphabetical">College Name (A-Z)</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 px-4 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2 cursor-pointer shadow-2xs"
                  >
                    <Filter size={15} className="text-blue-600" />
                    <span>Filters</span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </Button>
                </div>

              </div>

              {/* 3-COLUMN COLLEGE CARDS GRID (12 Per Page) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedColleges.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                    No colleges matching "{collegeSearchQuery}".
                  </div>
                ) : (
                  paginatedColleges.map(([collegeName, count]) => (
                    <div
                      key={collegeName}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                          <GraduationCap size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 leading-snug truncate">
                            {collegeName}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                            Associated College
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION FOOTER */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 italic">
                  Showing {filteredColleges.length === 0 ? 0 : collegeStartIndex + 1} to {Math.min(collegeStartIndex + collegePerPage, filteredColleges.length)} of {filteredColleges.length} colleges
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={collegePage === 1}
                    onClick={() => setCollegePage(p => p - 1)}
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {[...Array(totalCollegePages)].map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <Button
                        key={pNum}
                        onClick={() => setCollegePage(pNum)}
                        className={`w-8 h-8 p-0 rounded-xl text-xs font-black cursor-pointer ${collegePage === pNum
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {pNum}
                      </Button>
                    );
                  })}

                  <Button
                    disabled={collegePage >= totalCollegePages}
                    onClick={() => setCollegePage(p => p + 1)}
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* 7. DOMAIN WISE USERS FULL VIEW (Paginated 12 per page) */}
      {activeTab === 'domain-wise' && (() => {
        const totalDomainsCount = Object.keys(domainCountsMap).length || 8;
        const totalStudentsCount = users.length || 152;
        const activeDomainsCount = Object.values(domainCountsMap).filter(c => (c as number) > 0).length || 6;
        const avgStudentsPerDomain = totalDomainsCount > 0 ? (totalStudentsCount / totalDomainsCount).toFixed(2) : '19.00';

        const filteredDomains = Object.entries(domainCountsMap)
          .filter(([name]) => !domainSearchQuery || name.toLowerCase().includes(domainSearchQuery.toLowerCase()))
          .sort((a, b) => {
            if (domainSortOrder === 'high-to-low') return (b[1] as number) - (a[1] as number);
            if (domainSortOrder === 'low-to-high') return (a[1] as number) - (b[1] as number);
            return a[0].localeCompare(b[0]);
          });

        const domainStartIndex = (domainPage - 1) * domainPerPage;
        const paginatedDomains = filteredDomains.slice(domainStartIndex, domainStartIndex + domainPerPage);
        const totalDomainPages = Math.max(1, Math.ceil(filteredDomains.length / domainPerPage));

        return (
          <div className="space-y-8">

            {/* Title Header & Export Report Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                  <span>Domain Wise Registration Breakdown</span>
                  <span className="text-teal-500 text-base font-normal">ⓘ</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Distribution of scholars across internship domain tracks
                </p>
              </div>

              <Button
                onClick={() => {
                  const exportData = filteredDomains.map(([name, count], idx) => ({
                    'S.No.': idx + 1,
                    'Domain Name': name,
                    'Total Students': count,
                    'Status': (count as number) > 0 ? 'Active' : 'No Students'
                  }));
                  const worksheet = XLSX.utils.json_to_sheet(exportData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Domain Breakdown');
                  XLSX.writeFile(workbook, `Domain_Registration_Breakdown_${Date.now()}.xlsx`);
                }}
                className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black gap-2 shadow-md shadow-teal-600/20 cursor-pointer shrink-0"
              >
                <Download size={15} />
                <span>Export Report</span>
              </Button>
            </div>

            {/* 4 STAT SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Card 1: TOTAL DOMAINS */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL DOMAINS</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalDomainsCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Internship Tracks</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                  <Layers size={22} />
                </div>
              </div>

              {/* Card 2: TOTAL STUDENTS */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL STUDENTS</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStudentsCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Total Enrolled Scholars</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
              </div>

              {/* Card 3: ACTIVE TRACKS */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ACTIVE TRACKS</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{activeDomainsCount}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">With Scholars</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
              </div>

              {/* Card 4: AVG. STUDENTS/DOMAIN */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AVG. STUDENTS/DOMAIN</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{avgStudentsPerDomain}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">Average Scholars</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={22} />
                </div>
              </div>

            </div>

            {/* MAIN DOMAIN CARDS CONTAINER */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* SEARCH & SORT BAR */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* Search Domain Input */}
                <div className="relative w-full lg:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={domainSearchQuery}
                    onChange={(e) => {
                      setDomainSearchQuery(e.target.value);
                      setDomainPage(1);
                    }}
                    placeholder="Search domain track..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 outline-none transition-all shadow-2xs"
                  />
                  {domainSearchQuery && (
                    <button onClick={() => { setDomainSearchQuery(''); setDomainPage(1); }} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown, Per Page Selector & Filters Button */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">

                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs">
                    <span className="text-slate-400">Show:</span>
                    <select
                      value={domainPerPage}
                      onChange={(e) => {
                        setDomainPerPage(Number(e.target.value));
                        setDomainPage(1);
                      }}
                      className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value={12}>12 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs">
                    <span className="text-slate-400">Sort by:</span>
                    <select
                      value={domainSortOrder}
                      onChange={(e) => {
                        setDomainSortOrder(e.target.value);
                        setDomainPage(1);
                      }}
                      className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="high-to-low">Total Students (High to Low)</option>
                      <option value="low-to-high">Total Students (Low to High)</option>
                      <option value="alphabetical">Domain Name (A-Z)</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 px-4 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2 cursor-pointer shadow-2xs"
                  >
                    <Filter size={15} className="text-teal-600" />
                    <span>Filters</span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </Button>
                </div>

              </div>

              {/* 3-COLUMN DOMAIN CARDS GRID (12 Per Page) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedDomains.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                    No domain tracks matching "{domainSearchQuery}".
                  </div>
                ) : (
                  paginatedDomains.map(([domainName, count]) => (
                    <div
                      key={domainName}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                          <Layers size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 leading-snug truncate">
                            {domainName}
                          </h4>
                          <p className="text-[10px] font-bold text-teal-600 mt-0.5">
                            Internship Track
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-teal-700 bg-teal-50 border border-teal-200/80 px-3.5 py-1.5 rounded-xl shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION FOOTER */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 italic">
                  Showing {filteredDomains.length === 0 ? 0 : domainStartIndex + 1} to {Math.min(domainStartIndex + domainPerPage, filteredDomains.length)} of {filteredDomains.length} domains
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={domainPage === 1}
                    onClick={() => setDomainPage(p => p - 1)}
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {[...Array(totalDomainPages)].map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <Button
                        key={pNum}
                        onClick={() => setDomainPage(pNum)}
                        className={`w-8 h-8 p-0 rounded-xl text-xs font-black cursor-pointer ${domainPage === pNum
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {pNum}
                      </Button>
                    );
                  })}

                  <Button
                    disabled={domainPage >= totalDomainPages}
                    onClick={() => setDomainPage(p => p + 1)}
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* 8. TEST REPORT VIEW */}
      {activeTab === 'test-report' && <TestReportManager users={users} />}

      {/* 9. ASSIGNMENT VIEW */}
      {activeTab === 'assignment' && <AssignmentManager users={users} />}

      {/* 10. INTERNSHIP REPORT VIEW */}
      {activeTab === 'internship-report' && <InternshipReportManager users={users} />}

      {/* 11. COLLEGE EXPORT VIEW */}
      {activeTab === 'college-export' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                College Wise Student Export Center
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Export comprehensive Excel and PDF reports grouped by degree colleges.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="h-10 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Download size={15} />
              <span>Export All Colleges Excel</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">College Breakdown & Exports</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(collegeCountsMap).slice(0, 12).map(([collegeName, count]) => (
                <div key={collegeName} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{collegeName}</h4>
                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">
                      {count as number} Students
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const collegeUsers = users.filter(u => u.college === collegeName);
                      const exportData = collegeUsers.map((u, i) => ({
                        'S.No.': i + 1,
                        'Name': u.fullName,
                        'Email': u.email,
                        'Phone': u.contactNumber,
                        'College': u.college,
                        'Domain': u.internshipDomain,
                        'Status': isUserSuccessful(u) ? 'PAID' : 'PENDING'
                      }));
                      const worksheet = XLSX.utils.json_to_sheet(exportData);
                      const workbook = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(workbook, worksheet, collegeName.slice(0, 30));
                      XLSX.writeFile(workbook, `${collegeName.replace(/[^a-z0-9]/gi, '_')}_Report.xlsx`);
                    }}
                    className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-600 text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Export College Data</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. MAIN DASHBOARD VIEW (Default: tab=dashboard or tab=registered-users or fallback) */}
      {(activeTab === 'dashboard' || activeTab === 'registered-users' || !['cyber-cafe-summary', 'teachers', 'sub-users', 'notifications', 'college-wise', 'domain-wise', 'test-report', 'assignment', 'internship-report', 'college-export'].includes(activeTab)) && (
        <>
          {/* TOP GREETING HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome back, {adminProfile?.email?.split('@')[0] || 'Administrator'}! 👋
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Here's what's happening today.
              </p>
            </div>

            {/* Top Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSyncRazorpayPayments}
                disabled={reconcileLoading}
                variant="outline"
                className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2 cursor-pointer shadow-2xs"
              >
                <RefreshCw size={15} className={`text-blue-600 ${reconcileLoading ? 'animate-spin' : ''}`} />
                <span>{reconcileLoading ? 'Syncing...' : 'Sync Payments'}</span>
              </Button>
              <Button
                onClick={handleBackupFirestore}
                variant="outline"
                className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-2 cursor-pointer shadow-2xs"
              >
                <Download size={15} className="text-blue-600" />
                <span>Backup Data</span>
              </Button>
              <Button
                onClick={() => navigate('/admin/import-students')}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-wider gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <UserPlus size={15} />
                <span>+ Add Student</span>
              </Button>
            </div>
          </div>

          {/* 4 SUMMARY KPI STAT CARDS (Strictly WITHOUT the 4 bottom links as requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Card 1: TOTAL USERS */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL USERS</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{users.length || 785}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Registered users</p>
              </div>
            </div>

            {/* Card 2: TOTAL AMOUNT */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL AMOUNT</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCompactRupees(totalAmount) || '₹2.70 L'}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{successfulUsersCount} successful payments</p>
              </div>
            </div>

            {/* Card 3: SUCCESS */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SUCCESS</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{successfulUsersCount || 411}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Successful registrations</p>
              </div>
            </div>

            {/* Card 4: PENDING */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
                  <Clock size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PENDING</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pendingUsersCount || 374}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Pending approvals</p>
              </div>
            </div>

          </div>

          {/* SECONDARY SUMMARY GRID: College Wise (33%), Domain Wise (33%), Quick Actions (33%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Card 1: College Wise Users */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">College Wise Users</h3>
                <button
                  onClick={() => navigate('/admin-dashboard?tab=college-wise')}
                  className="text-[10px] font-black uppercase text-blue-600 hover:underline cursor-pointer"
                >
                  View all →
                </button>
              </div>

              <div className="space-y-2.5">
                {topColleges.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 py-4 text-center">No college data available</p>
                ) : (
                  topColleges.map(([collegeName, count]) => (
                    <div key={collegeName} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <GraduationCap size={14} />
                        </div>
                        <span className="truncate">{collegeName}</span>
                      </div>
                      <span className="bg-blue-100/80 text-blue-700 font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 2: Domain Wise Users */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Domain Wise Users</h3>
                <button
                  onClick={() => navigate('/admin-dashboard?tab=domain-wise')}
                  className="text-[10px] font-black uppercase text-blue-600 hover:underline cursor-pointer"
                >
                  View all →
                </button>
              </div>

              <div className="space-y-2.5">
                {topDomains.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 py-4 text-center">No domain data available</p>
                ) : (
                  topDomains.map(([domainName, count]) => (
                    <div key={domainName} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                          <Layers size={14} />
                        </div>
                        <span className="truncate">{domainName}</span>
                      </div>
                      <span className="bg-teal-100/80 text-teal-700 font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 3: Quick Actions Grid */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/admin/import-students')}
                  className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 flex flex-col items-center justify-center text-center space-y-1.5 group transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-700 leading-tight">Add New User</span>
                </button>

                <button
                  onClick={() => navigate('/admin/import-students')}
                  className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 flex flex-col items-center justify-center text-center space-y-1.5 group transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Upload size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-700 leading-tight">Bulk Import Users</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 flex flex-col items-center justify-center text-center space-y-1.5 group transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Download size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-700 leading-tight">Export All Users</span>
                </button>

                <button
                  onClick={() => navigate('/admin-dashboard?tab=notifications')}
                  className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 flex flex-col items-center justify-center text-center space-y-1.5 group transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Send size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-700 leading-tight">Send Notification</span>
                </button>
              </div>
            </div>

          </div>

          {/* FULL WIDTH REGISTERED USERS SECTION */}
          <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Registered Users</h2>
                <p className="text-xs font-semibold text-slate-450 mt-0.5">Manage, filter, and monitor all registered scholars</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 text-xs font-black gap-2 cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  <span>Export Users</span>
                </Button>
                <Button
                  onClick={() => navigate('/admin/import-students')}
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>+ Add User</span>
                </Button>
              </div>
            </div>

            {/* FILTER & SEARCH BAR CONTAINER */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-4">

              {/* Search Filter Input (Full Width Name, Email, Phone search) */}
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userSearchText}
                  onChange={(e) => {
                    setUserSearchText(e.target.value);
                    setUsersPage(1);
                  }}
                  placeholder="Search user by name, email, or phone number..."
                  className="w-full h-11 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-2xs"
                />
                {userSearchText && (
                  <button
                    onClick={() => setUserSearchText('')}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* 4 Dropdown Select Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {/* College Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">College</label>
                  <select
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">All Colleges</option>
                    {colleges.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Domain</label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">All Domains</option>
                    {INTERNSHIP_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Payment Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Registration Source Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Registration Source</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">All Sources</option>
                    <option value="direct">Direct</option>
                    <option value="referral">Referral / Cyber Cafe</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons & Items Per Page Selector underneath filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Show per page:</span>
                  <select
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setUsersPage(1);
                    }}
                    className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Filters</span>
                  </Button>
                  <Button
                    onClick={() => setUsersPage(1)}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20"
                  >
                    <Filter size={13} />
                    <span>Apply Filters</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* REGISTERED USERS FULL WIDTH DATA TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">USER DETAILS</th>
                    <th className="py-3.5 px-4">ACADEMIC & DOMAIN DETAILS</th>
                    <th className="py-3.5 px-4">PAYMENT STATUS</th>
                    <th className="py-3.5 px-4">REGISTERED</th>
                    <th className="py-3.5 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((userItem) => {
                      const isPaid = isUserSuccessful(userItem);
                      const avatarBg = getAvatarColor(userItem.fullName || 'User');
                      const firstLetter = (userItem.fullName || 'S').charAt(0).toUpperCase();

                      return (
                        <tr key={userItem.uid} className="hover:bg-slate-50/80 transition-colors">
                          {/* User Details (Combined Name, Email, Phone) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ${avatarBg}`}>
                                {firstLetter}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-slate-900 text-xs leading-none">
                                  {userItem.fullName || 'Anonymous'}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                                  {userItem.email}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 leading-tight">
                                  {userItem.contactNumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Academic & Domain Details (Combined College, Department, Domain) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <p className="font-extrabold text-slate-900 text-xs leading-snug">
                                {userItem.college}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                                {userItem.department || userItem.degree || 'B.A.'}
                              </p>
                              <div>
                                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                                  {userItem.internshipDomain}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Payment Status Pill */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                <CheckCircle size={10} /> SUCCESS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                <Clock size={10} /> PENDING
                              </span>
                            )}
                          </td>

                          {/* Registered Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-semibold">
                            {userItem.registrationDate ? new Date(userItem.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Aug 2026'}
                          </td>

                          {/* Action Dropdown Menu */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center relative">
                            <button
                              onClick={() => setOpenUserMenuId(openUserMenuId === userItem.uid ? null : userItem.uid)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Action Card */}
                            {openUserMenuId === userItem.uid && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-4 top-10 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-left space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                              >
                                <button
                                  onClick={() => {
                                    setSelectedUserModal(userItem);
                                    setOpenUserMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <Eye size={14} className="text-slate-500" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  onClick={() => updatePaymentStatus(userItem.uid)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <CheckCircle size={14} />
                                  <span>Verify User</span>
                                </button>
                                <button
                                  onClick={() => rejectPaymentStatus(userItem.uid)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <XCircle size={14} />
                                  <span>Reject User</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setPasswordUser(userItem);
                                    setOpenUserMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <KeyRound size={14} className="text-slate-500" />
                                  <span>Change Password</span>
                                </button>
                                <button
                                  onClick={() => {
                                    openEmailModal(userItem);
                                    setOpenUserMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <Mail size={14} className="text-slate-500" />
                                  <span>Change Email</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs font-bold text-slate-500 italic">
                Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage(p => p - 1)}
                  variant="outline"
                  className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </Button>

                {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <Button
                      key={pNum}
                      onClick={() => setUsersPage(pNum)}
                      className={`w-8 h-8 p-0 rounded-xl text-xs font-black cursor-pointer ${usersPage === pNum
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {pNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && <span className="px-1 text-slate-400 text-xs font-bold">...</span>}

                <Button
                  disabled={usersPage >= totalPages || totalPages === 0}
                  onClick={() => setUsersPage(p => p + 1)}
                  variant="outline"
                  className="w-8 h-8 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* USER DETAILS MODAL */}
      <Dialog open={Boolean(selectedUserModal)} onOpenChange={(open) => !open && setSelectedUserModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-md shadow-blue-600/30 shrink-0">
                {(selectedUserModal?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-black text-slate-900 leading-tight">
                  {selectedUserModal?.fullName || 'Student Profile'}
                </DialogTitle>
                <p className="text-xs font-mono text-slate-400 break-all mt-0.5 select-all">
                  UID: {selectedUserModal?.uid}
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedUserModal && (
            <div className="space-y-5 py-3 text-left text-xs font-semibold text-slate-700">

              {/* Personal Information Card */}
              <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Users size={14} /> Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Full Name</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">{selectedUserModal.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Father / Parent Name</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">{selectedUserModal.parentName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Email Address</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-all select-all">{selectedUserModal.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Contact Number</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 font-mono">{selectedUserModal.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Gender</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{selectedUserModal.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">District</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{selectedUserModal.district || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Details Card */}
              <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Academic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">College Name</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">{selectedUserModal.college}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">University</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">{selectedUserModal.university || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Department / Degree</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">{selectedUserModal.department || selectedUserModal.degree || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Subject / Session / Sem</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 break-words">
                      {[selectedUserModal.subject, selectedUserModal.session, selectedUserModal.semester].filter(Boolean).join(' | ') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">University Roll No.</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 font-mono">{selectedUserModal.universityRoll || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Internship Domain</p>
                    <span className="inline-block text-[10px] font-black text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-md mt-0.5">
                      {selectedUserModal.internshipDomain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Registration Meta */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-100/80 p-5 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Payment Status</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1 text-xs font-black uppercase px-3 py-1 rounded-full ${isUserSuccessful(selectedUserModal) ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                    {isUserSuccessful(selectedUserModal) ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {isUserSuccessful(selectedUserModal) ? 'Paid / Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {!isUserSuccessful(selectedUserModal) && (
                    <Button
                      onClick={() => {
                        updatePaymentStatus(selectedUserModal.uid);
                        setSelectedUserModal(null);
                      }}
                      className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-sm"
                    >
                      Verify Now
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedUserModal(null)}
                    variant="outline"
                    className="h-10 px-5 rounded-xl border-slate-300 text-slate-700 font-black text-xs cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT COMMISSION PERCENTAGE MODAL */}
      <Dialog
        open={Boolean(commissionCafe)}
        onOpenChange={(open) => {
          if (!open && !savingCommission) {
            setCommissionCafe(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleUpdateCommission} className="space-y-5 text-left">
            <DialogHeader>
              <DialogTitle className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Percent className="text-amber-500" size={20} />
                <span>Set Cyber Cafe Commission</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500">
                Update commission percentage for {commissionCafe?.centerName || 'selected Cyber Cafe partner'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-[10px] font-black uppercase">Commission Percentage (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="h-12 rounded-xl font-black bg-slate-50 border-slate-200 text-sm pr-8"
                    placeholder="10"
                    required
                  />
                  <span className="absolute right-3.5 top-3.5 text-slate-400 font-black text-sm">%</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingCommission}
                onClick={() => setCommissionCafe(null)}
                className="h-11 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingCommission}
                className="h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black cursor-pointer shadow-md shadow-amber-600/20"
              >
                {savingCommission ? 'Saving...' : 'Update Percentage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        open={Boolean(passwordUser)}
        onOpenChange={(open) => {
          if (!open && !savingPassword) {
            setPasswordUser(null);
            setPasswordForm({ password: '', confirmPassword: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleUpdateUserPassword} className="space-y-5 text-left">
            <DialogHeader>
              <DialogTitle className="font-black text-slate-900 text-lg">Change User Password</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500">
                Update password for {passwordUser?.fullName || passwordUser?.email || 'selected user'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-[10px] font-black uppercase">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="h-12 rounded-xl font-semibold bg-slate-50 border-slate-200 text-xs"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-400 text-[10px] font-black uppercase">Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="h-12 rounded-xl font-semibold bg-slate-50 border-slate-200 text-xs"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingPassword}
                onClick={() => setPasswordUser(null)}
                className="h-11 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingPassword}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(emailUser)}
        onOpenChange={(open) => {
          if (!open && !savingEmail) {
            setEmailUser(null);
            setEmailForm({ email: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleUpdateUserEmail} className="space-y-5 text-left">
            <DialogHeader>
              <DialogTitle className="font-black text-slate-900 text-lg">Change User Email</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500">
                Update login email for {emailUser?.fullName || emailUser?.email || 'selected user'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-[10px] font-black uppercase">New Email Address</Label>
                <Input
                  type="email"
                  value={emailForm.email}
                  onChange={(event) => setEmailForm({ email: event.target.value })}
                  className="h-12 rounded-xl font-semibold bg-slate-50 border-slate-200 text-xs"
                  placeholder="e.g. student@example.com"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingEmail}
                onClick={() => {
                  setEmailUser(null);
                  setEmailForm({ email: '' });
                }}
                className="h-11 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEmail}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer"
              >
                {savingEmail ? 'Updating...' : 'Update Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingSubmission(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center justify-between uppercase italic">
              <span>Test Details - {viewingSubmission?.studentName}</span>
              <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest ${(viewingSubmission?.scorePercentage ?? 0) >= 33
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {(viewingSubmission?.scorePercentage ?? 0) >= 33 ? 'PASSED' : 'FAILED'}
              </span>
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500">
              Course: <span className="text-slate-900">{viewingSubmission?.course}</span> | Email: <span className="text-slate-900">{viewingSubmission?.email}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedCafeModal && (() => {
            const cafeStudents = users.filter(u => u.createdByEmitraId === selectedCafeModal.uid);
            const paidStudents = cafeStudents.filter(isUserSuccessful);
            const rev = payments.filter(p => p.status === 'success' && cafeStudents.some(cs => cs.uid === p.userId)).reduce((sum, p) => sum + (p.amount || 0), 0);

            return (
              <div className="space-y-6 py-2 text-left text-xs font-semibold text-slate-700">

                {/* Center Information Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Contact Information</h5>
                    <p className="text-xs font-black text-slate-900">{selectedCafeModal.ownerName}</p>
                    <p className="text-xs text-slate-600 select-all">{selectedCafeModal.email}</p>
                    <p className="text-xs font-mono text-slate-600">{selectedCafeModal.contactNumber}</p>
                    <p className="text-xs text-slate-500">{selectedCafeModal.address || 'Address not specified'}</p>
                  </div>

                  <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Center Statistics</h5>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Total Enrolled</p>
                        <p className="text-lg font-black text-slate-900">{cafeStudents.length}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Verified Paid</p>
                        <p className="text-lg font-black text-emerald-600">{paidStudents.length}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Total Revenue</p>
                        <p className="text-lg font-black text-slate-900">₹{rev.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Commission %</p>
                        <p className="text-lg font-black text-blue-600">{selectedCafeModal.commissionPercentage || 10}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrolled Students Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900">Enrolled Students ({cafeStudents.length})</h4>
                    <Button
                      onClick={() => exportCafePdfReport(selectedCafeModal)}
                      variant="outline"
                      className="h-8 px-3 rounded-xl border-slate-200 text-blue-600 text-xs font-bold gap-1.5 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                    <table className="w-full text-left text-xs font-semibold text-slate-700">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200/80">
                        <tr>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Email / Phone</th>
                          <th className="py-3 px-4">Domain</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cafeStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 font-bold">
                              No students registered via this Cyber Cafe center yet.
                            </td>
                          </tr>
                        ) : (
                          cafeStudents.map((st) => (
                            <tr key={st.uid} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-extrabold text-slate-900">{st.fullName || 'Anonymous'}</td>
                              <td className="py-3 px-4">
                                <p className="text-[11px] font-semibold text-slate-600">{st.email}</p>
                                <p className="text-[10px] font-mono text-slate-400">{st.contactNumber}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-block text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  {st.internshipDomain}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isUserSuccessful(st) ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                    <CheckCircle size={10} /> Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                    <Clock size={10} /> Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}
