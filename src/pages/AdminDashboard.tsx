import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, addDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, LogOut, Mail, Phone, CheckCircle2, CreditCard, Clock, MapPin, GraduationCap, BookOpen, LayoutDashboard, Building2, List, Youtube, UserPlus, Download, Bell, Send, Upload, FileText, Trash2, ClipboardList } from 'lucide-react';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, User as FirebaseUser } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import firebaseConfig from '../../firebase-applet-config.json';
import { INTERNSHIP_DOMAINS } from '../lib/constants';
import { jsPDF } from 'jspdf';
import { backupFirestore } from "./backupFirestore";
import autoTable from 'jspdf-autotable';

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
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [exportCollege, setExportCollege] = useState('');
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
    description: string;
    file: File | null;
  }>({
    title: '',
    description: '',
    file: null
  });
  const [reportFileInputKey, setReportFileInputKey] = useState(0);
  const [assignmentFileInputKey, setAssignmentFileInputKey] = useState(0);
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
<<<<<<< HEAD
  const [backupLoading, setBackupLoading] = useState(false);
=======
  const [savingAssignment, setSavingAssignment] = useState(false);
>>>>>>> 2d52f09a455415e976773589f5cd1c5129c50fec

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

<<<<<<< HEAD
  const handleBackupFirestore = async () => {
    setBackupLoading(true);

    try {
      const result = await backupFirestore();
      const skippedCount = result.skippedCollections.length;
      const exportedCount = result.exportedCollections.length;

      if (skippedCount > 0) {
        alert(`Backup downloaded with ${exportedCount} collections. ${skippedCount} collections were skipped due to permissions or missing access. Check JSON metadata for details.`);
      } else {
        alert(`Backup downloaded successfully with ${exportedCount} collections.`);
      }
    } catch (error: any) {
      console.error('Error downloading Firestore backup:', error);
      alert(error?.message || 'Error downloading Firestore backup');
    } finally {
      setBackupLoading(false);
    }
  };

=======
  const handleCreateAssignment = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = assignmentForm.title.trim();
    const description = assignmentForm.description.trim();
    const file = assignmentForm.file;

    if (!title) {
      alert('Please add assignment title');
      return;
    }

    setSavingAssignment(true);

    try {
      const assignmentPayload: Omit<Assignment, 'id'> = {
        title,
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
        uploadData.append('folder', 'internmitra/assignments/global');

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

      setAssignmentForm({ title: '', description: '', file: null });
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
>>>>>>> 2d52f09a455415e976773589f5cd1c5129c50fec
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
            <Button
              type="button"
              onClick={handleBackupFirestore}
              disabled={backupLoading}
              className="h-10 px-4 font-black flex items-center gap-2"
            >
              <Download size={16} />
              {backupLoading ? 'Backing up...' : 'Backup'}
            </Button>
            <TabsTrigger value="teachers" className="px-6 py-2 font-black">
              <UserPlus size={16} />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-6 py-2 font-black">
              <Bell size={16} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="reports" className="px-6 py-2 font-black">
              <FileText size={16} />
              Internship Reports
            </TabsTrigger>
            <TabsTrigger value="student-reports" className="px-6 py-2 font-black">
              <Upload size={16} />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="college-export" className="px-6 py-2 font-black">
              <Download size={16} />
              College Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-blue-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Total Users</span>
                </div>
                <p className="text-4xl font-black text-slate-900">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-green-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Total Amount</span>
                </div>
                <p className="text-4xl font-black text-slate-900">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-400 font-bold">{successfulUsersCount} successful users</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Success</span>
                </div>
                <p className="text-4xl font-black text-slate-900">{successfulUsersCount}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-yellow-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Pending</span>
                </div>
                <p className="text-4xl font-black text-slate-900">{pendingUsersCount}</p>
              </div>
            </div>
            {/* FILTERS */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* COLLEGE FILTER */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">

                <h3 className="font-black text-slate-900 mb-4">
                  Filter By College
                </h3>

                <select
                  value={collegeFilter}
                  onChange={(e) =>
                    setCollegeFilter(e.target.value)
                  }
                  className="w-full h-14 rounded-xl border border-slate-200 px-4 font-bold"
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
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">

                <h3 className="font-black text-slate-900 mb-4">
                  Filter By Domain
                </h3>

                <select
                  value={domainFilter}
                  onChange={(e) =>
                    setDomainFilter(e.target.value)
                  }
                  className="w-full h-14 rounded-xl border border-slate-200 px-4 font-bold"
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
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">

                <h3 className="text-xl font-black mb-4">
                  College Wise Users
                </h3>

                <div className="space-y-3">

                  {Object.entries(collegeCount).map(
                    ([college, count]) => (

                      <div
                        key={college}
                        className="flex justify-between items-center border-b border-slate-100 pb-2"
                      >

                        <span className="text-slate-700 font-bold">
                          {college}
                        </span>

                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
                          {count as number}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* DOMAIN SUMMARY */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">

                <h3 className="text-xl font-black mb-4">
                  Domain Wise Users
                </h3>

                <div className="space-y-3">

                  {Object.entries(domainCount).map(
                    ([domain, count]) => (

                      <div
                        key={domain}
                        className="flex justify-between items-center border-b border-slate-100 pb-2"
                      >

                        <span className="text-slate-700 font-bold">
                          {domain}
                        </span>

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                          {count as number}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>
            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Registered Users</h2>
              </div>

              {users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
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
                        <tr key={user.uid} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="font-black text-slate-900">{user.fullName}</div>
                            <div className="text-xs text-slate-400">{user.uid}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail size={16} />
                              {user.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone size={16} />
                              {user.contactNumber}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{user.college}</td>
                          <td className="p-4 text-slate-600">{user.department}</td>
                          <td className="p-4 text-slate-600 font-bold">{user.internshipDomain}</td>
                          <td className="p-4">
                            {(() => {
                              const paymentStatus = getUserPaymentStatus(user.uid);
                              return (
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${paymentStatus.class}`}>
                                  {paymentStatus.status === 'Success' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                  {paymentStatus.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-4 text-slate-600 text-sm">

                            {new Date(user.registrationDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  updatePaymentStatus(user.uid)
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                              >
                                Verify
                              </button>

                              <button
                                onClick={() => rejectPaymentStatus(user.uid)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                              >
                                Reject
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
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Create Assignment</h2>
                      <p className="text-slate-500 text-sm font-bold">Add assignment questions course-wise. Students can upload answers only after an assignment is available.</p>
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                    {assignments.length} Assignments
                  </span>
                </div>

                <form onSubmit={handleCreateAssignment} className="border border-slate-100 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                    <div>
                      <Label className="text-slate-500 text-xs font-black uppercase">Assignment Title</Label>
                      <Input
                        value={assignmentForm.title}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })}
                        placeholder="Module 1 practical task"
                        className="mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-500 text-xs font-black uppercase">Question File</Label>
                      <Input
                        key={assignmentFileInputKey}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, file: event.target.files?.[0] || null })}
                        className="mt-2 h-12"
                      />
                    </div>
                    <Button type="submit" disabled={savingAssignment} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black">
                      <ClipboardList size={18} />
                      {savingAssignment ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Label className="text-slate-500 text-xs font-black uppercase">Instructions</Label>
                    <textarea
                      value={assignmentForm.description}
                      onChange={(event) => setAssignmentForm({ ...assignmentForm, description: event.target.value })}
                      placeholder="Write the assignment instructions students should follow"
                      className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                      <div key={assignment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-black text-slate-900">{assignment.title}</h3>
                            {assignment.description && (
                              <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-slate-600">{assignment.description}</p>
                            )}
                            {assignment.fileUrl && (
                              <a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-black uppercase tracking-wider text-blue-600">
                                Download question file
                              </a>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleDeleteAssignment(assignment)}
                            className="bg-red-600 hover:bg-red-700 text-white font-black"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Student Assignments</h2>
                      <p className="text-slate-500 text-sm font-bold">Every student PDF upload appears here with the optional description message.</p>
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                    {visibleStudentReports.length} Uploads
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-slate-500 text-xs font-black uppercase">Filter By College</Label>
                    <select
                      value={collegeFilter}
                      onChange={(event) => setCollegeFilter(event.target.value)}
                      className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                    <Label className="text-slate-500 text-xs font-black uppercase">Filter By Course</Label>
                    <select
                      value={domainFilter}
                      onChange={(event) => setDomainFilter(event.target.value)}
                      className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
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
                              <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                  <div className="font-black text-slate-900">{student?.fullName || report.studentName || 'Student'}</div>
                                  <div className="text-xs text-slate-400">{student?.email || report.email || report.userId}</div>
                                  <div className="mt-1 text-xs font-bold text-slate-500">{student?.college || '-'}</div>
                                </td>
                                <td className="p-4 text-slate-700 font-black">{getAssignmentTitle(report)}</td>
                                <td className="p-4 text-slate-600 font-bold">{report.course || student?.internshipDomain || '-'}</td>
                                <td className="p-4 text-slate-600">{report.fileName}</td>
                                <td className="p-4 text-sm font-bold leading-6 text-slate-600">
                                  {report.description || <span className="text-slate-400">No description</span>}
                                </td>
                                <td className="p-4 text-slate-600 text-sm">
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
                                    <Button type="button" className="bg-green-600 hover:bg-green-700 text-white font-black">
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

          <TabsContent value="college-export">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                    <Download size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">College Student Export</h2>
                    <p className="text-slate-500 text-sm font-bold">Select one college and export successful payment students as PDF.</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                  {exportCollege
                    ? users.filter(user =>
                      getGroupName(user.college) === exportCollege &&
                      isUserSuccessful(user)
                    ).length
                    : 0} Paid Students
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end border border-slate-100 rounded-2xl p-6">
                <div>
                  <Label className="text-slate-500 text-xs font-black uppercase">College</Label>
                  <select
                    value={exportCollege}
                    onChange={(event) => setExportCollege(event.target.value)}
                    className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  className="h-12 bg-green-600 hover:bg-green-700 text-white font-black px-6"
                >
                  <Download size={18} />
                  Export PDF
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">User Notifications</h2>
                    <p className="text-slate-500 text-sm font-bold">Add announcements that appear on every user profile page.</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                  {notifications.length} Notifications
                </span>
              </div>

              <form onSubmit={handleAddNotification} className="border border-slate-100 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_auto] gap-4 items-end">
                  <div>
                    <Label className="text-slate-500 text-xs font-black uppercase">Title</Label>
                    <Input
                      value={notificationForm.title}
                      onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })}
                      placeholder="Notification title"
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs font-black uppercase">Message</Label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })}
                      placeholder="Write notification message"
                      className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <Button type="submit" disabled={savingNotification} className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-black">
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
                    <div key={notification.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-900">{notification.title}</h3>
                          <p className="mt-2 text-sm font-bold leading-6 text-slate-600 whitespace-pre-line">{notification.message}</p>
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
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Internship Reports</h2>
                    <p className="text-slate-500 text-sm font-bold">Upload Internship reports course-wise. Students will see only their selected course reports.</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                  {courseReports.length} Reports
                </span>
              </div>

              <form onSubmit={handleUploadReport} className="border border-slate-100 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_260px_1fr_auto] gap-4 items-end">
                  <div>
                    <Label className="text-slate-500 text-xs font-black uppercase">Report Title</Label>
                    <Input
                      value={reportForm.title}
                      onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })}
                      placeholder="Monthly performance report"
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs font-black uppercase">Course</Label>
                    <select
                      value={reportForm.course}
                      onChange={(event) => setReportForm({ ...reportForm, course: event.target.value })}
                      className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                    <Label className="text-slate-500 text-xs font-black uppercase">Report File</Label>
                    <Input
                      key={reportFileInputKey}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(event) => setReportForm({ ...reportForm, file: event.target.files?.[0] || null })}
                      className="mt-2 h-12"
                    />
                  </div>
                  <Button type="submit" disabled={savingReport} className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-black">
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
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                          <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-black text-slate-900">{report.title}</div>
                              <div className="text-xs text-slate-400">{report.id}</div>
                            </td>
                            <td className="p-4 text-slate-600 font-bold">{report.course}</td>
                            <td className="p-4 text-slate-600">{report.fileName}</td>
                            <td className="p-4 text-slate-600 text-sm">
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
                                  <Button type="button" className="bg-green-600 hover:bg-green-700 text-white font-black">
                                    <Download size={16} />
                                    Download
                                  </Button>
                                </a>
                                <Button
                                  type="button"
                                  onClick={() => handleDeleteReport(report)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-black"
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
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Teacher Management</h2>
                    <p className="text-slate-500 text-sm font-bold">Teachers can access only Daily Videos.</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                  {teachers.length} Teachers
                </span>
              </div>

              <Tabs defaultValue="add" className="gap-6">
                <TabsList className="bg-slate-100 h-11 p-1">
                  <TabsTrigger value="add" className="px-5 py-2 font-black">
                    <UserPlus size={16} />
                    Add Teacher
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-5 py-2 font-black">
                    <Users size={16} />
                    Teacher List
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add">
                  <form onSubmit={handleAddTeacher} className="border border-slate-100 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <Label className="text-slate-500 text-xs font-black uppercase">Teacher Name</Label>
                        <Input
                          value={teacherForm.fullName}
                          onChange={(event) => setTeacherForm({ ...teacherForm, fullName: event.target.value })}
                          placeholder="Teacher name"
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs font-black uppercase">Email</Label>
                        <Input
                          type="email"
                          value={teacherForm.email}
                          onChange={(event) => setTeacherForm({ ...teacherForm, email: event.target.value })}
                          placeholder="teacher@example.com"
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs font-black uppercase">Password</Label>
                        <Input
                          type="password"
                          value={teacherForm.password}
                          onChange={(event) => setTeacherForm({ ...teacherForm, password: event.target.value })}
                          placeholder="Minimum 6 characters"
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-500 text-xs font-black uppercase">Course</Label>
                        <select
                          value={teacherForm.course}
                          onChange={(event) => setTeacherForm({ ...teacherForm, course: event.target.value })}
                          className="mt-2 w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="">Select course</option>
                          {INTERNSHIP_DOMAINS.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" disabled={savingTeacher} className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-black">
                        <UserPlus size={18} />
                        {savingTeacher ? 'Adding...' : 'Add Teacher'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="list">
                  {teachers.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                      <Users size={48} className="text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold">No teachers added yet</p>
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
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
                              <tr key={teacher.uid} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                  <div className="font-black text-slate-900">{teacher.fullName}</div>
                                  <div className="text-xs text-slate-400">{teacher.uid}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Mail size={16} />
                                    {teacher.email}
                                  </div>
                                </td>
                                <td className="p-4 text-slate-600 font-bold">
                                  {teacher.course || '-'}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {teacher.isActive ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                    {teacher.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-600 text-sm">
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
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
