import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Users, LogOut, Mail, Phone, CheckCircle2, XCircle, CreditCard, Clock, MapPin, GraduationCap, BookOpen, LayoutDashboard, Building2, List, Youtube } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  contactNumber: string;
  college: string;
  department: string;
  isPaid: boolean;
  registrationDate: string;
}

interface Payment {
  userId: string;
  amount: number;
  status: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user, adminProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Payment Status</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
