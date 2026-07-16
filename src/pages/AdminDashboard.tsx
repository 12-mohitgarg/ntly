import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, addDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Users, LogOut, Mail, Phone, CheckCircle2, CreditCard, Clock, MapPin, GraduationCap, BookOpen, LayoutDashboard, Building2, List, Youtube, UserPlus, Download, Bell, Send, Upload, FileText, Trash2, ClipboardList, KeyRound } from 'lucide-react';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, User as FirebaseUser } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import firebaseConfig from '../../firebase-applet-config.json';
import { INTERNSHIP_DOMAINS } from '../lib/constants';
import { jsPDF } from 'jspdf';
import { backupFirestore } from "./backupFirestore";
import autoTable from 'jspdf-autotable';

import { QuizSubmission } from './dashboard/generateTestReport';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  contactNumber: string;
  college: string;
  department: string;
  internshipDomain: string;
  isPaid: boolean;
  registrationDate: string;
}

interface Payment {
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  status: string;
  timestamp: string;
}

interface TeacherProfile {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  course?: string;
  createdAt?: string;
  isActive: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  isActive: boolean;
}

interface CourseReport {
  id: string;
  title: string;
  course: string;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId?: string;
  storagePath?: string;
  uploadedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  cloudinaryPublicId?: string;
  createdAt?: string;
  isActive?: boolean;
}

interface StudentReport {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  course: string;
  assignmentId?: string;
  assignmentTitle?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  type?: string;
  uploadedAt?: string;
}

export default function AdminDashboard() {
  const { user, adminProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [courseReports, setCourseReports] = useState<CourseReport[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [testSubmissions, setTestSubmissions] = useState<QuizSubmission[]>([]);
  const [courseTests, setCourseTests] = useState<any[]>([]);
  const [testCourseFilter, setTestCourseFilter] = useState('');
  const [viewingSubmission, setViewingSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [exportCollege, setExportCollege] = useState('');
  const [passwordUser, setPasswordUser] = useState<UserProfile | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    course: ''
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
  const [savingNotification, setSavingNotification] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('registrationDate', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);

      // Fetch payments
      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);
      const paymentsData = paymentsSnapshot.docs.map(doc => doc.data() as Payment);
      setPayments(paymentsData);

      // Fetch teachers
      const teachersQuery = query(collection(db, 'admins'), where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersData = teachersSnapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as TeacherProfile))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setTeachers(teachersData);

      // Fetch notifications
      const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notificationsData);

      // Fetch course reports
      const reportsQuery = query(collection(db, 'courseReports'), orderBy('uploadedAt', 'desc'));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseReport));
      setCourseReports(reportsData);

      // Fetch assignments created by admin/teachers.
      const assignmentsQuery = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(assignmentsData);

      // Fetch student uploaded assignments/reports from both the new and legacy submission collections.
      const studentReportsData: StudentReport[] = [];

      await getDocs(query(collection(db, 'studentReports'), orderBy('uploadedAt', 'desc')))
        .then((snapshot) => {
          studentReportsData.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentReport)));
        })
        .catch((error) => {
          console.error('Error fetching studentReports:', error);
        });

      await getDocs(query(collection(db, 'submissions'), where('type', '==', 'studentReport')))
        .then((snapshot) => {
          studentReportsData.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentReport)));
        })
        .catch((error) => {
          console.error('Error fetching fallback submissions:', error);
        });

      setStudentReports(
        studentReportsData.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''))
      );

      // Fetch test submissions
      try {
        const testSubmissionsSnapshot = await getDocs(collection(db, 'testSubmissions'));
        const testSubmissionsData = testSubmissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setTestSubmissions(testSubmissionsData);
      } catch (error) {
        console.error('Error fetching testSubmissions:', error);
      }

      // Fetch course tests
      try {
        const courseTestsSnapshot = await getDocs(collection(db, 'courseTests'));
        const courseTestsData = courseTestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setCourseTests(courseTestsData);
      } catch (error) {
        console.error('Error fetching courseTests:', error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleBackupFirestore = async () => {
    if (backupLoading) return;

    setBackupLoading(true);
    try {
      const result = await backupFirestore();
      const skippedCount = result.skippedCollections.length;
      alert(
        skippedCount > 0
          ? `Backup downloaded. ${skippedCount} collection(s) could not be exported.`
          : 'Firestore backup downloaded successfully.'
      );
    } catch (error) {
      console.error('Error backing up Firestore:', error);
      alert(error instanceof Error ? error.message : 'Failed to backup Firestore.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleAddTeacher = async (event: React.FormEvent) => {
    event.preventDefault();

    const fullName = teacherForm.fullName.trim();
    const email = teacherForm.email.trim().toLowerCase();
    const password = teacherForm.password;
    const course = teacherForm.course;

    if (!fullName || !email || !password || !course) {
      alert('Please fill in teacher name, email, password, and course');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSavingTeacher(true);
    let createdTeacher: FirebaseUser | null = null;

    try {
      const teacherAppName = 'teacher-create-app';
      const teacherApp = getApps().some(app => app.name === teacherAppName)
        ? getApp(teacherAppName)
        : initializeApp(firebaseConfig, teacherAppName);
      const teacherAuth = getAuth(teacherApp);
      const credential = await createUserWithEmailAndPassword(teacherAuth, email, password);
      createdTeacher = credential.user;

      await setDoc(doc(db, 'admins', credential.user.uid), {
        uid: credential.user.uid,
        fullName,
        email,
        password: '',
        role: 'teacher',
        course,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || adminProfile?.email || 'admin'
      });

      await signOut(teacherAuth);
      setTeacherForm({ fullName: '', email: '', password: '', course: '' });
      fetchData();
      alert('Teacher added successfully');
    } catch (error: any) {
      if (createdTeacher) {
        await deleteUser(createdTeacher).catch((deleteError) => {
          console.error('Error cleaning up teacher auth user:', deleteError);
        });
      }
      console.error('Error adding teacher:', error);
      alert(error?.message || 'Error adding teacher');
    } finally {
      setSavingTeacher(false);
    }
  };

  const handleAddNotification = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = notificationForm.title.trim();
    const message = notificationForm.message.trim();

    if (!title || !message) {
      alert('Please fill in notification title and message');
      return;
    }

    setSavingNotification(true);

    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || adminProfile?.email || 'admin'
      });

      setNotificationForm({ title: '', message: '' });
      fetchData();
      alert('Notification added successfully');
    } catch (error: any) {
      console.error('Error adding notification:', error);
      alert(error?.message || 'Error adding notification');
    } finally {
      setSavingNotification(false);
    }
  };

  const handleUploadReport = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = reportForm.title.trim();
    const course = reportForm.course;
    const file = reportForm.file;

    if (!title || !course || !file) {
      alert('Please select course, report title, and file');
      return;
    }

    setSavingReport(true);

    try {
      const cloudName = 'de6uqmt1m';
      const uploadPreset = 'hm8borsg';

      if (!cloudName || !uploadPreset) {
        alert('Cloudinary credentials are missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
        return;
      }

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', uploadPreset);
      uploadData.append('folder', `internmitra/course-reports/${course.replace(/[^a-z0-9]+/gi, '_')}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Cloudinary upload failed');
      }

      const uploadResult = await response.json();

      await addDoc(collection(db, 'courseReports'), {
        title,
        course,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.uid || adminProfile?.email || 'admin'
      });

      setReportForm({ title: '', course: '', file: null });
      setReportFileInputKey((key) => key + 1);
      fetchData();
      alert('Course report uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading report:', error);
      alert(error?.message || 'Error uploading report');
    } finally {
      setSavingReport(false);
    }
  };

  const handleDeleteReport = async (report: CourseReport) => {
    if (!confirm(`Delete report "${report.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'courseReports', report.id));
      fetchData();
      alert('Report deleted successfully');
    } catch (error: any) {
      console.error('Error deleting report:', error);
      alert(error?.message || 'Error deleting report');
    }
  };

  const handleCreateAssignment = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = assignmentForm.title.trim();
    const course = assignmentForm.course.trim();
    const description = assignmentForm.description.trim();
    const file = assignmentForm.file;

    if (!title) {
      alert('Please add assignment title');
      return;
    }

    if (!course) {
      alert('Please select assignment course');
      return;
    }

    setSavingAssignment(true);

    try {
      const assignmentPayload: Omit<Assignment, 'id'> = {
        title,
        course,
        description,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      if (file) {
        const cloudName = 'de6uqmt1m';
        const uploadPreset = 'hm8borsg';

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', uploadPreset);
        uploadData.append('folder', `internmitra/assignments/${course.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
          method: 'POST',
          body: uploadData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Cloudinary upload failed');
        }

        const uploadResult = await response.json();
        assignmentPayload.fileName = file.name;
        assignmentPayload.fileUrl = uploadResult.secure_url;
        assignmentPayload.cloudinaryPublicId = uploadResult.public_id;
      }

      await addDoc(collection(db, 'assignments'), {
        ...assignmentPayload,
        createdBy: user?.uid || adminProfile?.email || 'admin'
      });

      setAssignmentForm({ title: '', course: '', description: '', file: null });
      setAssignmentFileInputKey((key) => key + 1);
      fetchData();
      alert('Assignment added successfully');
    } catch (error: any) {
      console.error('Error adding assignment:', error);
      alert(error?.message || 'Error adding assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`Delete assignment "${assignment.title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'assignments', assignment.id));
      fetchData();
      alert('Assignment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      alert(error?.message || 'Error deleting assignment');
    }
  };
  const updatePaymentStatus = async (
    userId: string
  ) => {

    try {

      // payment find
      const paymentQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );

      const paymentSnapshot = await getDocs(paymentQuery);

      // agar payment already h
      if (!paymentSnapshot.empty) {

        paymentSnapshot.forEach(async (paymentDoc) => {

          await updateDoc(
            doc(db, 'payments', paymentDoc.id),
            {
              status: 'success'
            }
          );

        });

      } else {

        // new payment entry create
        // user document get
        const userDocRef = doc(db, 'users', userId);

        const userDocSnap = await getDoc(userDocRef);

        let amount = 1000;

        if (userDocSnap.exists()) {

          const userData = userDocSnap.data();

          // college find
          const collegesQuery = await getDocs(
            collection(db, 'colleges')
          );

          const collegeData = collegesQuery.docs.find(
            (c) => c.data().name === userData.college
          );

          if (collegeData) {
            amount = collegeData.data().price || 1000;
          }
        }

        // payment entry create
        await addDoc(
          collection(db, 'payments'),
          {
            userId: userId,
            razorpayOrderId: `manual_order_${Date.now()}`,
            razorpayPaymentId: `manual_pay_${Date.now()}`,
            amount: amount,
            status: 'success',
            timestamp: new Date().toISOString()
          }
        );

      }

      // user find
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );

      const userSnapshot = await getDocs(userQuery);

      userSnapshot.forEach(async (userDoc) => {

        await updateDoc(
          doc(db, 'users', userDoc.id),
          {
            isPaid: true
          }
        );

      });

      alert('Payment verified successfully');

      fetchData();

    } catch (error) {

      console.error(error);

      alert('Error verifying payment');
    }
  };

  const rejectPaymentStatus = async (userId: string) => {
    try {

      // payment find
      const paymentQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );

      const paymentSnapshot = await getDocs(paymentQuery);

      // payment records delete
      paymentSnapshot.forEach(async (paymentDoc) => {
        await deleteDoc(
          doc(db, 'payments', paymentDoc.id)
        );
      });

      // user find
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );

      const userSnapshot = await getDocs(userQuery);

      userSnapshot.forEach(async (userDoc) => {
        await updateDoc(
          doc(db, 'users', userDoc.id),
          {
            isPaid: false
          }
        );
      });

      alert('Payment rejected successfully');

      fetchData();

    } catch (error) {

      console.error(error);

      alert('Error rejecting payment');
    }
  };

  const openPasswordModal = (student: UserProfile) => {
    setPasswordUser(student);
    setPasswordForm({ password: '', confirmPassword: '' });
  };

  const handleUpdateUserPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!passwordUser || !user) return;

    if (passwordForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${passwordUser.uid}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: passwordUser.uid, password: passwordForm.password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.details || result?.error || 'Error updating password');
      }

      setPasswordUser(null);
      setPasswordForm({ password: '', confirmPassword: '' });
      alert('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert(error?.message || 'Error updating password');
    } finally {
      setSavingPassword(false);
    }
  };

  const getGroupName = (value?: string) => value?.trim() || 'Not specified';

  const successfulUserIds = new Set(
    payments
      .filter((payment) => payment.status === 'success' && payment.userId)
      .map((payment) => payment.userId)
  );

  const isUserSuccessful = (user: UserProfile) =>
    Boolean(user.isPaid || successfulUserIds.has(user.uid));

  const uniqueColleges = [
    ...new Set(users.map(user => getGroupName(user.college)))
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

  const filteredUsers = users.filter(user => {


    const collegeMatch =
      !collegeFilter ||
      getGroupName(user.college) === collegeFilter;

    const domainMatch =
      !domainFilter ||
      getGroupName(user.internshipDomain) === domainFilter;

    return collegeMatch && domainMatch;
  });
  const successfulUsers = users.filter(isUserSuccessful);

  const collegeCount = filteredUsers.reduce<Record<string, number>>(
    (acc, user) => {
      const college = getGroupName(user.college);

      acc[college] =
        (acc[college] || 0) + 1;

      return acc;

    },
    {}
  );

  const domainCount = filteredUsers.reduce<Record<string, number>>(
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
  const totalAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.amount || 0), 0);

  // Get payment status for a user
  const getUserPaymentStatus = (userId: string) => {
    const tableUser = users.find((profile) => profile.uid === userId);
    if (tableUser?.isPaid || successfulUserIds.has(userId)) {
      return { status: 'Success', class: 'bg-green-100 text-green-700' };
    }

    const userPayment = payments.find(p => p.userId === userId);
    if (!userPayment) return { status: 'Pending', class: 'bg-yellow-100 text-yellow-700' };
    return { status: 'Pending', class: 'bg-yellow-100 text-yellow-700' };
  };

  const exportCollegeStudentsPdf = () => {
    if (!exportCollege) {
      alert('Please select a college');
      return;
    }

    const collegeStudents = users.filter(user =>
      getGroupName(user.college) === exportCollege &&
      isUserSuccessful(user)
    );

    if (collegeStudents.length === 0) {
      alert('No successful payment students found for this college');
      return;
    }

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const generatedAt = new Date().toLocaleString('en-IN');

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 297, 24, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('INTERNMITRA COLLEGE STUDENT REPORT', 148, 15, { align: 'center' });

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(13);
    pdf.text(exportCollege, 14, 38);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Successful Payment Students: ${collegeStudents.length}`, 14, 46);
    pdf.text(`Generated: ${generatedAt}`, 14, 53);

    autoTable(pdf, {
      startY: 62,
      head: [['Name', 'Email', 'Phone', 'Department', 'Domain', 'Payment', 'Registered']],
      body: collegeStudents.map(student => [
        student.fullName || '-',
        student.email || '-',
        student.contactNumber || '-',
        student.department || '-',
        student.internshipDomain || '-',
        'Success',
        student.registrationDate
          ? new Date(student.registrationDate).toLocaleDateString('en-IN')
          : '-'
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    pdf.save(`InternMitra_${exportCollege.replace(/[^a-z0-9]/gi, '_')}_Students.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Dialog
        open={Boolean(passwordUser)}
        onOpenChange={(open) => {
          if (!open && !savingPassword) {
            setPasswordUser(null);
            setPasswordForm({ password: '', confirmPassword: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <form onSubmit={handleUpdateUserPassword} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-black text-slate-900">Change Password</DialogTitle>
              <DialogDescription>
                Update password for {passwordUser?.fullName || passwordUser?.email || 'selected user'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-500 text-xs font-black uppercase">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
                  className="h-12 rounded-xl font-bold"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 text-xs font-black uppercase">Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                  className="h-12 rounded-xl font-bold"
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
                onClick={() => {
                  setPasswordUser(null);
                  setPasswordForm({ password: '', confirmPassword: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingPassword} className="bg-slate-900 hover:bg-blue-700 text-white font-black">
                {savingPassword ? 'Updating...' : 'Update Password'}
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

          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Score</p>
              <p className="text-2xl font-black text-blue-600">{viewingSubmission?.scorePercentage}%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Total Questions</p>
              <p className="text-2xl font-black text-slate-700">{viewingSubmission?.totalQuestions}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Correct</p>
              <p className="text-2xl font-black text-green-600">{viewingSubmission?.correctCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Wrong</p>
              <p className="text-2xl font-black text-red-600">{viewingSubmission?.wrongCount}</p>
            </div>
          </div>

          {/* Warning for modified tests */}
          {(() => {
            if (!viewingSubmission) return null;
            const matchingTest = courseTests.find(t => t.course === viewingSubmission.course);
            if (!matchingTest || !matchingTest.questions) return null;

            const studentAnswerKeys = Object.keys(viewingSubmission.answers || {});
            const currentQuestionIds = new Set(matchingTest.questions.map((q: any) => q.id));
            const deletedQuestionIds = studentAnswerKeys.filter(id => !currentQuestionIds.has(id));

            if (deletedQuestionIds.length === 0) return null;

            return (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl mb-6 text-sm font-bold flex items-start gap-3 shadow-sm">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-black text-amber-950 uppercase tracking-wide text-xs">Test Questions Have Been Modified</p>
                  <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                    The admin has added, modified, or deleted {deletedQuestionIds.length} question(s) in this course test since the student submitted their answers.
                    Because the test questions were changed, some of the student's answered questions are no longer present in the active test definition and cannot be fully displayed.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Questions list */}
          <div className="space-y-6">
            {(() => {
              if (!viewingSubmission) return null;
              // Find matching test
              const matchingTest = courseTests.find(t => t.course === viewingSubmission.course);
              if (!matchingTest || !matchingTest.questions || matchingTest.questions.length === 0) {
                return (
                  <p className="text-center text-slate-500 font-bold py-6">
                    Questions template for this course test was not found.
                  </p>
                );
              }

              const studentAnswerKeys = Object.keys(viewingSubmission.answers || {});
              const currentQuestionIds = new Set(matchingTest.questions.map((q: any) => q.id));
              const deletedQuestionIds = studentAnswerKeys.filter(id => !currentQuestionIds.has(id));

              const renderedQuestions = matchingTest.questions.map((q: any, index: number) => {
                const selectedAnswer = viewingSubmission.answers[q.id];
                const isUnanswered = selectedAnswer === undefined;
                const isCorrect = !isUnanswered && selectedAnswer === q.correctOptionIndex;

                return (
                  <div key={q.id || index} className={`p-6 rounded-2xl border-2 ${isCorrect
                    ? 'border-green-100 bg-green-50/10'
                    : isUnanswered
                      ? 'border-yellow-100 bg-yellow-50/10'
                      : 'border-red-100 bg-red-50/10'
                    }`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${isCorrect
                          ? 'bg-green-100 text-green-700'
                          : isUnanswered
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          Question {index + 1}
                        </span>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-wider ${isCorrect
                        ? 'text-green-600'
                        : isUnanswered
                          ? 'text-yellow-600'
                          : 'text-red-600'
                        }`}>
                        {isCorrect ? 'Correct' : isUnanswered ? 'Unanswered / Added Later' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-lg font-bold text-slate-900 mb-4">{q.questionText}</p>

                    <div className="grid gap-3">
                      {q.options.map((opt: string, optIndex: number) => {
                        const isStudentChoice = selectedAnswer === optIndex;
                        const isCorrectAnswer = q.correctOptionIndex === optIndex;

                        let optionStyle = 'border-slate-100 bg-white text-slate-700';
                        if (isCorrectAnswer) {
                          optionStyle = 'border-green-500 bg-green-50 text-green-900 font-black';
                        } else if (isStudentChoice && !isCorrect) {
                          optionStyle = 'border-red-500 bg-red-50 text-red-900 font-black';
                        }

                        return (
                          <div
                            key={optIndex}
                            className={`p-4 rounded-xl border flex items-center gap-3 ${optionStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${isCorrectAnswer
                              ? 'bg-green-600 text-white'
                              : isStudentChoice
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                              }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-sm">{opt}</span>

                            {isCorrectAnswer && (
                              <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Correct Answer
                              </span>
                            )}
                            {isStudentChoice && !isCorrectAnswer && (
                              <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                Student's Choice
                              </span>
                            )}
                            {isStudentChoice && isCorrectAnswer && (
                              <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                                Student's Correct Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });

              const renderedDeletedQuestions = deletedQuestionIds.map((qId, idx) => {
                const selectedOptionIndex = viewingSubmission.answers[qId];
                return (
                  <div key={qId} className="p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-600">
                          Modified/Deleted Question
                        </span>
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Content Unavailable
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-500 italic">This question has been deleted or its identifier was modified in the course test.</p>
                    <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-white text-slate-700 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs bg-slate-100 text-slate-500">
                        {String.fromCharCode(65 + (selectedOptionIndex ?? 0))}
                      </span>
                      <span className="text-sm font-bold text-slate-500">Student selected option (Question content no longer available)</span>
                    </div>
                  </div>
                );
              });

              return (
                <div className="space-y-6">
                  {renderedQuestions}
                  {renderedDeletedQuestions}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="mt-8 border-t border-slate-100 pt-4">
            <Button
              type="button"
              className="bg-slate-900 hover:bg-slate-800 text-white font-black"
              onClick={() => setViewingSubmission(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm font-bold">{adminProfile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin-dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/districts">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <MapPin size={18} />
                Districts
              </Button>
            </Link>
            <Link to="/admin/colleges">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <GraduationCap size={18} />
                Colleges
              </Button>
            </Link>
            <Link to="/admin/courses">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <BookOpen size={18} />
                Courses
              </Button>
            </Link>
            <Link to="/admin/universities">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <Building2 size={18} />
                Universities
              </Button>
            </Link>
            <Link to="/admin/subjects">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <List size={18} />
                Subjects
              </Button>
            </Link>
            <Link to="/admin/daily-videos">
              <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
                <Youtube size={18} />
                Daily Videos
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/10 flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs defaultValue="dashboard" className="gap-6 flex-col">
          <TabsList className="bg-white border border-slate-100 shadow-lg h-12 p-1">
            <TabsTrigger value="dashboard" className="px-6 py-2 font-black">
              <LayoutDashboard size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="teachers" className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={14} />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={14} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="reports" className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} />
              Internship Reports
            </TabsTrigger>
            <TabsTrigger value="student-reports" className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Upload size={14} />
              Assignments
            </TabsTrigger>
            {/* <TabsTrigger value="test-reports" className="px-6 py-2 font-black">
              <ClipboardList size={16} />
              Test Reports
            </TabsTrigger> */}
            {/* <TabsTrigger value="college-export" className="px-6 py-2 font-black">
              <Download size={16} />
              College Export
            </TabsTrigger> */}
          </TabsList >

          <TabsContent value="dashboard" className="space-y-8 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="student-card p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/15 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Users size={20} />
                  </div>
                  <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Total Users</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900">{users.length}</p>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-indigo-600/5 rounded-full" />
              </div>

              <div className="student-card p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/15 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Total Amount</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900">₹{totalAmount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{successfulUsersCount} successful payments</p>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-600/5 rounded-full" />
              </div>

              <div className="student-card p-6 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/15 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-600/10 rounded-xl flex items-center justify-center text-teal-600 shadow-inner">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Success</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900">{successfulUsersCount}</p>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-teal-600/5 rounded-full" />
              </div>

              <div className="student-card p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/15 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Clock size={20} />
                  </div>
                  <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Pending</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900">{pendingUsersCount}</p>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-600/5 rounded-full" />
              </div>
            </div>
            {/* FILTERS */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* COLLEGE FILTER */}
              <div className="student-card p-6 bg-white/80">

                <h3 className="student-label mb-3">
                  Filter By College
                </h3>

                <select
                  value={collegeFilter}
                  onChange={(e) =>
                    setCollegeFilter(e.target.value)
                  }
                  className="student-input"
                >

                  <option value="">
                    All Colleges
                  </option>

                  {uniqueColleges.map((college) => (

                    <option
                      key={college}
                      value={college}
                    >
                      {college}
                    </option>

                  ))}

                </select>

              </div>

              {/* DOMAIN FILTER */}
              <div className="student-card p-6 bg-white/80">

                <h3 className="student-label mb-3">
                  Filter By Domain
                </h3>

                <select
                  value={domainFilter}
                  onChange={(e) =>
                    setDomainFilter(e.target.value)
                  }
                  className="student-input"
                >

                  <option value="">
                    All Domains
                  </option>

                  {uniqueDomains.map((domain) => (

                    <option
                      key={domain}
                      value={domain}
                    >
                      {domain}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* FILTER SUMMARY */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* COLLEGE SUMMARY */}
              <div className="student-card p-6 bg-white/80">

                <h3 className="text-xl font-black mb-4 gradient-text">
                  College Wise Users
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">

                  {Object.entries(collegeCount).map(
                    ([college, count]) => (

                      <div
                        key={college}
                        className="flex justify-between items-center border-b border-slate-100/50 pb-3 last:border-b-0"
                      >

                        <span className="text-slate-700 font-bold text-sm">
                          {college}
                        </span>

                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-black ring-1 ring-indigo-100/80">
                          {count as number}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* DOMAIN SUMMARY */}
              <div className="student-card p-6 bg-white/80">

                <h3 className="text-xl font-black mb-4 gradient-text">
                  Domain Wise Users
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">

                  {Object.entries(domainCount).map(
                    ([domain, count]) => (

                      <div
                        key={domain}
                        className="flex justify-between items-center border-b border-slate-100/50 pb-3 last:border-b-0"
                      >

                        <span className="text-slate-700 font-bold text-sm">
                          {domain}
                        </span>

                        <span className="bg-teal-50 text-teal-600 px-3 py-1.5 rounded-xl text-xs font-black ring-1 ring-teal-100/80">
                          {count as number}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>
            {/* Users Table */}
            <div className="student-card bg-white/80 overflow-hidden">
              <div className="p-6 border-b border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 gradient-text">Registered Users</h2>
                <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  {filteredUsers.length} of {users.length} Users
                </span>
              </div>

              {users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[1000px] table-auto">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Name</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Email</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Phone</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">College</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Department</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Domain</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Payment Status</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Registered</th>
                        <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="border-b border-slate-100/50 hover:bg-indigo-50/10 transition-colors">
                          <td className="p-4">
                            <div className="font-black text-slate-900">{user.fullName}</div>
                            <div className="text-xs text-slate-400 font-semibold">{user.uid}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                              <Mail size={14} className="text-slate-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                              <Phone size={14} className="text-slate-400" />
                              {user.contactNumber}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 text-sm font-medium">{user.college}</td>
                          <td className="p-4 text-slate-600 text-sm font-medium">{user.department}</td>
                          <td className="p-4 text-slate-600 font-bold text-sm">{user.internshipDomain}</td>
                          <td className="p-4">
                            {(() => {
                              const paymentStatus = getUserPaymentStatus(user.uid);
                              return (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${paymentStatus.status === 'Success'
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80'
                                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100/80'
                                  }`}>
                                  {paymentStatus.status === 'Success' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {paymentStatus.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-4 text-slate-600 text-sm font-medium">

                            {new Date(user.registrationDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  updatePaymentStatus(user.uid)
                                }
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                Verify
                              </button>

                              <button
                                onClick={() => rejectPaymentStatus(user.uid)}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-rose-600/10 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                Reject
                              </button>

                              <button
                                onClick={() => openPasswordModal(user)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Update password"
                              >
                                <KeyRound size={14} />
                                Change Password
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="student-reports">
            <div className="space-y-6">
              <div className="student-card p-6 bg-white/80">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="student-icon">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 gradient-text">Create Assignment</h2>
                      <p className="text-slate-500 text-sm font-semibold">Add assignment questions course-wise. Students can upload answers only after an assignment is available.</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-indigo-100/80">
                    {assignments.length} Assignments
                  </span>
                </div>

                <form onSubmit={handleCreateAssignment} className="border border-slate-100/50 rounded-2xl p-5 mb-6 bg-slate-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                    <div>
                      <Label className="student-label">Assignment Title</Label>
                      <Input
                        value={assignmentForm.title}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })}
                        placeholder="Module 1 practical task"
                        className="student-input mt-2 h-12 px-4"
                      />
                    </div>
                    <div>
                      <Label className="student-label">Course</Label>
                      <select
                        value={assignmentForm.course}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, course: event.target.value })}
                        className="student-input mt-2 h-12 px-4"
                        required
                      >
                        <option value="">Select Course</option>
                        {INTERNSHIP_DOMAINS.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="student-label">Question File</Label>
                      <Input
                        key={assignmentFileInputKey}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, file: event.target.files?.[0] || null })}
                        className="student-input mt-2 h-12 px-4 py-2"
                      />
                    </div>
                    <Button type="submit" disabled={savingAssignment} className="student-button-primary h-12 px-5 min-h-[48px] shadow-indigo-600/10 cursor-pointer">
                      <ClipboardList size={18} />
                      {savingAssignment ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Label className="student-label">Instructions</Label>
                    <textarea
                      value={assignmentForm.description}
                      onChange={(event) => setAssignmentForm({ ...assignmentForm, description: event.target.value })}
                      placeholder="Write the assignment instructions students should follow"
                      className="student-input mt-2 min-h-24 py-3"
                    />
                  </div>
                </form>

                {assignments.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                    <ClipboardList size={44} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No assignments added yet</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="student-card p-5 bg-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-black text-slate-900">{assignment.title}</h3>
                            <p className="mt-1 text-xs font-black uppercase tracking-wider text-indigo-600">{assignment.course || 'Course not set'}</p>
                            {assignment.description && (
                              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{assignment.description}</p>
                            )}
                            {assignment.fileUrl && (
                              <a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors">
                                Download question file
                              </a>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleDeleteAssignment(assignment)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-black p-2.5 rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="student-card p-6 bg-white/80">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="student-icon text-emerald-600 bg-emerald-50 ring-emerald-100">
                      <Upload size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 gradient-text">Student Assignments</h2>
                      <p className="text-slate-500 text-sm font-semibold">Every student PDF upload appears here with the optional description message.</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-emerald-100/80">
                    {visibleStudentReports.length} Uploads
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="student-label">Filter By College</Label>
                    <select
                      value={collegeFilter}
                      onChange={(event) => setCollegeFilter(event.target.value)}
                      className="student-input mt-2 h-12 px-4"
                    >
                      <option value="">All Colleges</option>
                      {uniqueColleges.map((college) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="student-label">Filter By Course</Label>
                    <select
                      value={domainFilter}
                      onChange={(event) => setDomainFilter(event.target.value)}
                      className="student-input mt-2 h-12 px-4"
                    >
                      <option value="">All Courses</option>
                      {uniqueDomains.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {visibleStudentReports.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <Upload size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No student assignments uploaded yet</p>
                  </div>
                ) : (
                  <div className="student-card overflow-hidden bg-white/50 border-slate-100/50">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full min-w-[1000px] table-auto">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Assignment</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">File</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Description</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Uploaded</th>
                            <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleStudentReports.map((report) => {
                            const student = getStudentProfile(report.userId);

                            return (
                              <tr key={report.id} className="border-b border-slate-100/50 hover:bg-indigo-50/10 transition-colors">
                                <td className="p-4">
                                  <div className="font-black text-slate-900">{student?.fullName || report.studentName || 'Student'}</div>
                                  <div className="text-xs text-slate-400 font-semibold">{student?.email || report.email || report.userId}</div>
                                  <div className="mt-1 text-xs font-bold text-slate-500">{student?.college || '-'}</div>
                                </td>
                                <td className="p-4 text-slate-700 font-black">{getAssignmentTitle(report)}</td>
                                <td className="p-4 text-slate-600 font-bold">{report.course || student?.internshipDomain || '-'}</td>
                                <td className="p-4 text-slate-600 text-sm font-medium">{report.fileName}</td>
                                <td className="p-4 text-sm font-semibold leading-6 text-slate-600">
                                  {report.description || <span className="text-slate-400">No description</span>}
                                </td>
                                <td className="p-4 text-slate-600 text-sm font-medium">
                                  {report.uploadedAt
                                    ? new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                    : '-'}
                                </td>
                                <td className="p-4">
                                  <a href={report.fileUrl} target="_blank" rel="noreferrer" download>
                                    <Button type="button" className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5">
                                      <Download size={16} />
                                      Download
                                    </Button>
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test-reports">
            <div className="space-y-6">
              {/* Summary Stats */}
              {(() => {
                const isTeacher = adminProfile?.role === 'teacher';
                const assignedCourse = adminProfile?.course || '';

                const visibleTestSubmissions = testSubmissions.filter((sub) => {
                  if (isTeacher && sub.course !== assignedCourse) return false;
                  if (testCourseFilter && sub.course !== testCourseFilter) return false;
                  return true;
                });

                const totalTestsCount = visibleTestSubmissions.length;
                const passedTestsCount = visibleTestSubmissions.filter(sub => sub.scorePercentage >= 33).length;
                const failedTestsCount = totalTestsCount - passedTestsCount;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                          <ClipboardList className="text-blue-600" size={24} />
                          <span className="text-slate-500 font-black uppercase text-xs">Total Assessments Taken</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900">{totalTestsCount}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="text-green-600" size={24} />
                          <span className="text-slate-500 font-black uppercase text-xs">Passed Students</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900">{passedTestsCount}</p>
                        <p className="text-sm text-slate-400 font-bold">
                          {totalTestsCount > 0 ? Math.round((passedTestsCount / totalTestsCount) * 100) : 0}% Pass Rate
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-red-600" size={24} />
                          <span className="text-slate-500 font-black uppercase text-xs">Failed Students</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900">{failedTestsCount}</p>
                        <p className="text-sm text-slate-400 font-bold">Score below 33%</p>
                      </div>
                    </div>

                    {/* Course-wise Filter */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <ClipboardList size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-slate-900">Student Assessment Reports</h2>
                            <p className="text-slate-500 text-sm font-bold">View question-by-question breakdown, grades, and completion status of final tests.</p>
                          </div>
                        </div>
                        {!isTeacher && (
                          <div className="w-full md:w-64">
                            <Label className="text-slate-500 text-xs font-black uppercase">Filter By Course</Label>
                            <select
                              value={testCourseFilter}
                              onChange={(event) => setTestCourseFilter(event.target.value)}
                              className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">All Courses</option>
                              {INTERNSHIP_DOMAINS.map((domain) => (
                                <option key={domain} value={domain}>
                                  {domain}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                      {visibleTestSubmissions.length === 0 ? (
                        <div className="p-12 text-center">
                          <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 font-bold">No test submissions found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Score</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Answers</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Submitted At</th>
                                <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleTestSubmissions.map((sub) => {
                                const student = getStudentProfile(sub.userId);
                                const isPassed = sub.scorePercentage >= 33;

                                return (
                                  <tr key={sub.userId + '-' + sub.course} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-black text-slate-900">{sub.studentName}</div>
                                      <div className="text-xs text-slate-400">{sub.email}</div>
                                      {student?.college && (
                                        <div className="mt-1 text-xs font-bold text-slate-500">{student.college}</div>
                                      )}
                                    </td>
                                    <td className="p-4 text-slate-600 font-bold">{sub.course}</td>
                                    <td className="p-4">
                                      <span className="text-lg font-black text-slate-900">{sub.scorePercentage}%</span>
                                    </td>
                                    <td className="p-4 text-slate-600 font-bold">
                                      {sub.correctCount} / {sub.totalQuestions}
                                    </td>
                                    <td className="p-4">
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {isPassed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {isPassed ? 'PASSED' : 'FAILED'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm">
                                      {sub.submittedAt
                                        ? new Date(sub.submittedAt).toLocaleString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                        : '-'}
                                    </td>
                                    <td className="p-4">
                                      <Button
                                        type="button"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                                        onClick={() => setViewingSubmission(sub)}
                                      >
                                        View Details
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="college-export">
            <div className="student-card p-6 bg-white/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="student-icon bg-emerald-50 text-emerald-600 ring-emerald-100">
                    <Download size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 gradient-text">College Student Export</h2>
                    <p className="text-slate-500 text-sm font-semibold">Select one college and export successful payment students as PDF.</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-emerald-100/80">
                  {exportCollege
                    ? users.filter(user =>
                      getGroupName(user.college) === exportCollege &&
                      isUserSuccessful(user)
                    ).length
                    : 0} Paid Students
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end border border-slate-100/50 rounded-2xl p-5 bg-slate-50/30">
                <div>
                  <Label className="student-label">College</Label>
                  <select
                    value={exportCollege}
                    onChange={(event) => setExportCollege(event.target.value)}
                    className="student-input mt-2 h-12 px-4"
                  >
                    <option value="">Select college</option>
                    {uniqueColleges.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  onClick={exportCollegeStudentsPdf}
                  disabled={!exportCollege}
                  className="student-button-primary bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 shadow-emerald-600/10 cursor-pointer"
                >
                  <Download size={18} />
                  Export PDF
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="student-card p-6 bg-white/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="student-icon bg-blue-50 text-blue-600 ring-blue-100">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 gradient-text">User Notifications</h2>
                    <p className="text-slate-500 text-sm font-semibold">Add announcements that appear on every user profile page.</p>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-blue-100/80">
                  {notifications.length} Notifications
                </span>
              </div>

              <form onSubmit={handleAddNotification} className="border border-slate-100/50 rounded-2xl p-5 mb-6 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_auto] gap-4 items-end">
                  <div>
                    <Label className="student-label">Title</Label>
                    <Input
                      value={notificationForm.title}
                      onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })}
                      placeholder="Notification title"
                      className="student-input mt-2 h-12 px-4"
                    />
                  </div>
                  <div>
                    <Label className="student-label">Message</Label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })}
                      placeholder="Write notification message"
                      className="student-input mt-2 min-h-12 py-3"
                    />
                  </div>
                  <Button type="submit" disabled={savingNotification} className="student-button-primary bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-5 min-h-[48px] shadow-indigo-600/10 cursor-pointer">
                    <Send size={18} />
                    {savingNotification ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </form>

              {notifications.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <Bell size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No notifications added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="student-card p-5 bg-white/60 hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-900">{notification.title}</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 whitespace-pre-line">{notification.message}</p>
                        </div>
                        <div className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            : '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="student-card p-6 bg-white/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="student-icon bg-indigo-50 text-indigo-600 ring-indigo-100">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 gradient-text">Internship Reports</h2>
                    <p className="text-slate-500 text-sm font-semibold">Upload Internship reports course-wise. Students will see only their selected course reports.</p>
                  </div>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-indigo-100/80">
                  {courseReports.length} Reports
                </span>
              </div>

              <form onSubmit={handleUploadReport} className="border border-slate-100/50 rounded-2xl p-5 mb-6 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_260px_1fr_auto] gap-4 items-end">
                  <div>
                    <Label className="student-label">Report Title</Label>
                    <Input
                      value={reportForm.title}
                      onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })}
                      placeholder="Monthly performance report"
                      className="student-input mt-2 h-12 px-4"
                    />
                  </div>
                  <div>
                    <Label className="student-label">Course</Label>
                    <select
                      value={reportForm.course}
                      onChange={(event) => setReportForm({ ...reportForm, course: event.target.value })}
                      className="student-input mt-2 h-12 px-4"
                    >
                      <option value="">Select course</option>
                      {INTERNSHIP_DOMAINS.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="student-label">Report File</Label>
                    <Input
                      key={reportFileInputKey}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(event) => setReportForm({ ...reportForm, file: event.target.files?.[0] || null })}
                      className="student-input mt-2 h-12 px-4 py-2"
                    />
                  </div>
                  <Button type="submit" disabled={savingReport} className="student-button-primary bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-5 min-h-[48px] shadow-indigo-600/10 cursor-pointer">
                    <Upload size={18} />
                    {savingReport ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>

              {courseReports.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <FileText size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No course reports uploaded yet</p>
                </div>
              ) : (
                <div className="student-card overflow-hidden bg-white/50 border-slate-100/50">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[800px] table-auto">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Report</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">File</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Uploaded</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseReports.map((report) => (
                          <tr key={report.id} className="border-b border-slate-100/50 hover:bg-indigo-50/10 transition-colors">
                            <td className="p-4">
                              <div className="font-black text-slate-900">{report.title}</div>
                              <div className="text-xs text-slate-400 font-semibold">{report.id}</div>
                            </td>
                            <td className="p-4 text-slate-600 font-bold">{report.course}</td>
                            <td className="p-4 text-slate-600 text-sm font-medium">{report.fileName}</td>
                            <td className="p-4 text-slate-600 text-sm font-medium">
                              {report.uploadedAt
                                ? new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                                : '-'}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <a href={report.fileUrl} target="_blank" rel="noreferrer" download>
                                  <Button type="button" className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5">
                                    <Download size={16} />
                                    Download
                                  </Button>
                                </a>
                                <Button
                                  type="button"
                                  onClick={() => handleDeleteReport(report)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider hover:bg-rose-700 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teachers">
            <div className="student-card p-4 sm:p-6 bg-white/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="student-icon bg-blue-50 text-blue-600 ring-blue-100">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 gradient-text">Teacher Management</h2>
                    <p className="text-slate-500 text-sm font-semibold">Teachers can access only Daily Videos.</p>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ring-1 ring-blue-100/80 w-fit">
                  {teachers.length} Teachers
                </span>
              </div>

              <Tabs defaultValue="add" className="gap-6 flex-col">
                <TabsList className="bg-slate-100/70 rounded-xl h-11 p-1">
                  <TabsTrigger value="add" className="px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    <UserPlus size={16} />
                    Add Teacher
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    <Users size={16} />
                    Teacher List
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add">
                  <form onSubmit={handleAddTeacher} className="border border-slate-200/60 rounded-3xl p-4 sm:p-6 bg-white/70 backdrop-blur-sm shadow-sm mt-4">
                    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-5 lg:items-end w-full">
                      <div className="w-full">
                        <Label className="student-label">Teacher Name</Label>
                        <Input
                          value={teacherForm.fullName}
                          onChange={(event) => setTeacherForm({ ...teacherForm, fullName: event.target.value })}
                          placeholder="Teacher name"
                          className="student-input mt-2 h-12 px-4 rounded-xl border-slate-200/80"
                        />
                      </div>
                      <div className="w-full">
                        <Label className="student-label">Email</Label>
                        <Input
                          type="email"
                          value={teacherForm.email}
                          onChange={(event) => setTeacherForm({ ...teacherForm, email: event.target.value })}
                          placeholder="teacher@example.com"
                          className="student-input mt-2 h-12 px-4 rounded-xl border-slate-200/80"
                        />
                      </div>
                      <div className="w-full">
                        <Label className="student-label">Password</Label>
                        <Input
                          type="password"
                          value={teacherForm.password}
                          onChange={(event) => setTeacherForm({ ...teacherForm, password: event.target.value })}
                          placeholder="Minimum 6 characters"
                          className="student-input mt-2 h-12 px-4 rounded-xl border-slate-200/80"
                        />
                      </div>
                      <div className="w-full">
                        <Label className="student-label">Course</Label>
                        <select
                          value={teacherForm.course}
                          onChange={(event) => setTeacherForm({ ...teacherForm, course: event.target.value })}
                          className="student-input mt-2 h-12 px-4 rounded-xl border-slate-200/80 bg-white"
                        >
                          <option value="">Select course</option>
                          {INTERNSHIP_DOMAINS.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full">
                        <Button type="submit" disabled={savingTeacher} className="student-button-primary bg-blue-600 hover:bg-blue-700 text-white h-12 w-full px-5 min-h-[48px] shadow-blue-500/10 cursor-pointer rounded-xl transition-all">
                          <UserPlus size={18} />
                          {savingTeacher ? 'Adding...' : 'Add Teacher'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="list" className="mt-4">
                  {teachers.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                      <Users size={48} className="text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold">No teachers added yet</p>
                    </div>
                  ) : (
                    <div className="student-card overflow-hidden bg-white/50 border-slate-100/50">
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] table-auto">
                          <thead className="bg-slate-50/50">
                            <tr>
                              <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Teacher</th>
                              <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Email</th>
                              <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                              <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                              <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map((teacher) => (
                              <tr key={teacher.uid} className="border-b border-slate-100/50 hover:bg-indigo-50/10 transition-colors">
                                <td className="p-4">
                                  <div className="font-black text-slate-900">{teacher.fullName}</div>
                                  <div className="text-xs text-slate-400 font-semibold">{teacher.uid}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                                    <Mail size={14} className="text-slate-400" />
                                    {teacher.email}
                                  </div>
                                </td>
                                <td className="p-4 text-slate-600 font-bold text-sm">
                                  {teacher.course || '-'}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${teacher.isActive
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80'
                                    : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100/80'
                                    }`}>
                                    {teacher.isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {teacher.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-600 text-sm font-medium">
                                  {teacher.createdAt
                                    ? new Date(teacher.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card List View */}
                      <div className="lg:hidden divide-y divide-slate-100/50">
                        {teachers.map((teacher) => (
                          <div key={teacher.uid} className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="font-black text-slate-900 text-sm">{teacher.fullName}</div>
                                <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]">{teacher.uid}</div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${teacher.isActive
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80'
                                : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100/80'
                                }`}>
                                {teacher.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs text-slate-600 font-medium">
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                <span className="truncate">{teacher.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen size={12} className="text-slate-400 shrink-0" />
                                <span>{teacher.course || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <span>
                                  {teacher.createdAt
                                    ? new Date(teacher.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                    : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs >
      </div >
    </div >
  );
}
