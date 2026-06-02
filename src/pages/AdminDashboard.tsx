import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, addDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, LogOut, Mail, Phone, CheckCircle2, CreditCard, Clock, MapPin, GraduationCap, BookOpen, LayoutDashboard, Building2, List, Youtube, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut, User as FirebaseUser } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import firebaseConfig from '../../firebase-applet-config.json';
import { INTERNSHIP_DOMAINS } from '../lib/constants';

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

export default function AdminDashboard() {
  const { user, adminProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    course: ''
  });
  const [savingTeacher, setSavingTeacher] = useState(false);

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
  const uniqueColleges = [
    ...new Set(users.map(user => user.college))
  ];

  const uniqueDomains = [
    ...new Set(users.map(user => user.internshipDomain))
  ];

  const filteredUsers = users.filter(user => {

    const collegeMatch =
      !collegeFilter ||
      user.college === collegeFilter;

    const domainMatch =
      !domainFilter ||
      user.internshipDomain === domainFilter;

    return collegeMatch && domainMatch;
  });
  const successUsers = filteredUsers.filter((user) => {

    const payment = payments.find(
      (p) =>
        p.userId === user.uid &&
        p.status === 'success'
    );

    return payment;
  });

  const collegeCount = successUsers.reduce(
    (acc: any, user) => {

      acc[user.college] =
        (acc[user.college] || 0) + 1;

      return acc;

    },
    {}
  );

  const domainCount = filteredUsers.reduce(
    (acc: any, user) => {

      acc[user.internshipDomain] =
        (acc[user.internshipDomain] || 0) + 1;

      return acc;

    },
    {}
  );
  // Calculate payment statistics
  const successfulPayments = payments.filter(p => p.status === 'success').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.amount || 0), 0);

  // Get payment status for a user
  const getUserPaymentStatus = (userId: string) => {
    const userPayment = payments.find(p => p.userId === userId);
    if (!userPayment) return { status: 'Pending', class: 'bg-yellow-100 text-yellow-700' };
    if (userPayment.status === 'success') return { status: 'Success', class: 'bg-green-100 text-green-700' };
    return { status: 'Pending', class: 'bg-yellow-100 text-yellow-700' };
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
            <TabsTrigger value="teachers" className="px-6 py-2 font-black">
              <UserPlus size={16} />
              Teachers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Stats */}
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
                <p className="text-sm text-slate-400 font-bold">{successfulPayments} successful payments</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Success</span>
                </div>
                <p className="text-4xl font-black text-slate-900">{successfulPayments}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-yellow-600" size={24} />
                  <span className="text-slate-500 font-black uppercase text-xs">Pending</span>
                </div>
                <p className="text-4xl font-black text-slate-900">{pendingPayments}</p>
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
