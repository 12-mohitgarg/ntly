import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Clock, LogOut, Mail, Phone, Plus, Users } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/button';

interface EmitraStudent {
  uid: string;
  fullName: string;
  email: string;
  contactNumber: string;
  college: string;
  internshipDomain: string;
  isPaid: boolean;
  registrationDate: string;
}

interface Payment {
  userId: string;
  createdByEmitraId?: string | null;
  amount: number;
  status: string;
}

export default function EmitraDashboard() {
  const { user, emitraProfile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<EmitraStudent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const studentsQuery = query(
        collection(db, 'users'),
        where('createdByEmitraId', '==', user.uid)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs
        .map((studentDoc) => ({
          uid: studentDoc.id,
          ...studentDoc.data()
        } as EmitraStudent))
        .sort((a, b) => (b.registrationDate || '').localeCompare(a.registrationDate || ''));
      setStudents(studentsData);

      const paymentsSnapshot = await getDocs(query(
        collection(db, 'payments'),
        where('createdByEmitraId', '==', user.uid)
      ));
      setPayments(paymentsSnapshot.docs.map((paymentDoc) => paymentDoc.data() as Payment));
    } catch (error) {
      console.error('Error loading Emitra students:', error);
    } finally {
      setLoading(false);
    }
  };

  const successfulPaymentIds = useMemo(
    () => new Set(payments.filter((payment) => payment.status === 'success').map((payment) => payment.userId)),
    [payments]
  );

  const paidStudents = students.filter((student) => student.isPaid || successfulPaymentIds.has(student.uid));
  const totalPaidAmount = payments
    .filter((payment) => payment.status === 'success' && students.some((student) => student.uid === payment.userId))
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const estimatedCommission = Math.round(totalPaidAmount * ((emitraProfile?.commissionPercentage || 0) / 100));

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-black">Loading Cyber cafe dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link to="/emitra-dashboard" className="flex items-center gap-3">
            <img src="/logo-new.jpeg" alt="InternMitra" className="h-11 w-auto rounded-lg border border-slate-100" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-600">Cyber cafe Portal</p>
              <h1 className="text-sm font-black uppercase text-slate-900">{emitraProfile?.centerName || 'Cyber cafe Dashboard'}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/emitra/register-student">
              <Button className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest">
                <Plus size={16} />
                Add Student
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="h-11 rounded-xl text-xs font-black uppercase tracking-widest">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-blue-600">
              <Users size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Students</span>
            </div>
            <p className="mt-4 text-4xl font-black text-slate-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paid Students</span>
            </div>
            <p className="mt-4 text-4xl font-black text-slate-900">{paidStudents.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600">
              <Clock size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Commission Rate</span>
            </div>
            <p className="mt-4 text-4xl font-black text-slate-900">{emitraProfile?.commissionPercentage || 0}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-indigo-600">
              <ArrowRight size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimated Commission</span>
            </div>
            <p className="mt-4 text-4xl font-black text-slate-900">₹{estimatedCommission.toLocaleString('en-IN')}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Registered Students</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Only students registered from this Cyber cafe login appear here.</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest">
              {students.length} Total
            </span>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-bold text-slate-500">No students registered yet</p>
              <Link to="/emitra/register-student" className="mt-5 inline-flex">
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs">
                  <Plus size={16} />
                  Register First Student
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Contact</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">College</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Domain</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Payment</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const isPaid = student.isPaid || successfulPaymentIds.has(student.uid);

                    return (
                      <tr key={student.uid} className="border-b border-slate-100 hover:bg-blue-50/20">
                        <td className="p-4">
                          <div className="font-black text-slate-900">{student.fullName}</div>
                          <div className="text-xs font-semibold text-slate-400">{student.uid}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {student.email}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {student.contactNumber}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold text-slate-600">{student.college}</td>
                        <td className="p-4 text-sm font-black text-slate-700">{student.internshipDomain}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isPaid ? 'Success' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-semibold text-slate-600">
                          {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
