import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, CreditCard, LogOut, Mail, Phone, Search, Users } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UserProfile } from '../types';

export default function CollegeDashboard() {
  const { collegeProfile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!collegeProfile?.collegeName) return;

      setLoading(true);
      try {
        const studentsQuery = query(
          collection(db, 'users'),
          where('college', '==', collegeProfile.collegeName)
        );
        const snapshot = await getDocs(studentsQuery);
        const data = snapshot.docs
          .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile))
          .sort((a, b) => (b.registrationDate || '').localeCompare(a.registrationDate || ''));
        setStudents(data);
      } catch (error) {
        console.error('Error fetching college students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [collegeProfile?.collegeName]);

  const isPaymentComplete = (student: UserProfile) =>
    student.paymentStatus !== 'rejected' &&
    Boolean(student.isPaid || student.hasPaid || student.paymentStatus === 'success');

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return students;

    return students.filter((student) =>
      [
        student.fullName,
        student.email,
        student.contactNumber,
        student.universityRoll,
        student.internshipDomain,
        student.gender,
      ].join(' ').toLowerCase().includes(value)
    );
  }, [search, students]);

  const paidCount = students.filter(isPaymentComplete).length;
  const pendingCount = students.length - paidCount;
  const genderCount = students.reduce<Record<string, number>>((acc, student) => {
    const gender = student.gender?.trim() || 'Not specified';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight sm:text-xl">{collegeProfile?.collegeName || 'College Dashboard'}</h1>
              <p className="text-xs font-bold text-slate-500">Student payment and gender report</p>
            </div>
          </div>
          <Button onClick={handleLogout} className="h-11 rounded-xl bg-slate-900 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Users size={18} />
              <span className="text-xs font-black uppercase tracking-wider">Total Students</span>
            </div>
            <p className="mt-3 text-3xl font-black">{students.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 size={18} />
              <span className="text-xs font-black uppercase tracking-wider">Payment Complete</span>
            </div>
            <p className="mt-3 text-3xl font-black">{paidCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600">
              <Clock size={18} />
              <span className="text-xs font-black uppercase tracking-wider">Payment Pending</span>
            </div>
            <p className="mt-3 text-3xl font-black">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-blue-600">
              <CreditCard size={18} />
              <span className="text-xs font-black uppercase tracking-wider">College Login</span>
            </div>
            <p className="mt-3 truncate text-sm font-black">{collegeProfile?.email}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black">Gender Summary</h2>
              <p className="text-xs font-semibold text-slate-500">Counts are based on registered students for this college.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(genderCount).length === 0 ? (
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-100">No data</span>
              ) : (
                Object.entries(genderCount).map(([gender, count]) => (
                  <span key={gender} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                    {gender}: {count}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black">Students</h2>
              <p className="text-xs font-semibold text-slate-500">Showing {filteredStudents.length} of {students.length} records.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student"
                className="h-10 rounded-xl pl-10 text-sm font-semibold"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-56 items-center justify-center text-sm font-bold text-slate-500">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm font-bold text-slate-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] table-auto">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Contact</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Gender</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Roll No.</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Course</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const paymentComplete = isPaymentComplete(student);
                    return (
                      <tr key={student.uid} className="hover:bg-blue-50/30">
                        <td className="p-4">
                          <div className="font-black text-slate-900">{student.fullName}</div>
                          <div className="text-xs font-semibold text-slate-500">{student.department || student.subject || '-'}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Mail size={14} className="text-slate-400" />
                            {student.email}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Phone size={14} className="text-slate-400" />
                            {student.contactNumber || '-'}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">{student.gender || '-'}</td>
                        <td className="p-4 text-sm font-bold text-slate-700">{student.universityRoll || '-'}</td>
                        <td className="p-4 text-sm font-bold text-slate-700">{student.internshipDomain || '-'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ring-1 ${
                            paymentComplete
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              : 'bg-amber-50 text-amber-700 ring-amber-100'
                          }`}>
                            {paymentComplete ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {paymentComplete ? 'Complete' : 'Pending'}
                          </span>
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
