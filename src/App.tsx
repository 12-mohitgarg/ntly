/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Contact = lazy(() => import('./pages/Contact'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const EmitraRegister = lazy(() => import('./pages/EmitraRegister'));
const EmitraDashboard = lazy(() => import('./pages/EmitraDashboard'));
const EmitraPayment = lazy(() => import('./pages/EmitraPayment'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Payment = lazy(() => import('./pages/Payment'));
const ManageDistricts = lazy(() => import('./pages/admin/ManageDistricts'));
const ManageColleges = lazy(() => import('./pages/admin/ManageColleges'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageUniversities = lazy(() => import('./pages/admin/ManageUniversities'));
const ManageSubjects = lazy(() => import('./pages/admin/ManageSubjects'));
const ManageDailyVideos = lazy(() => import('./pages/admin/ManageDailyVideos'));
const BulkAddColleges = lazy(() => import('./pages/admin/BulkAddColleges'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));

function PageLoader() {
  return <div className="h-screen flex items-center justify-center">Loading...</div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, isEmitra, adminProfile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (isAdmin) return <Navigate to={adminProfile?.role === 'teacher' ? '/admin/daily-videos' : '/admin-dashboard'} replace />;
  if (isEmitra) return <Navigate to="/emitra-dashboard" replace />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile && !profile.isPaid && window.location.pathname !== '/payment') return <Navigate to="/payment" />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, adminProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/login" />;
  if (adminProfile?.role === 'teacher' && location.pathname !== '/admin/daily-videos') {
    return <Navigate to="/admin/daily-videos" replace />;
  }

  return <>{children}</>;
}

function EmitraRoute({ children }: { children: React.ReactNode }) {
  const { user, isEmitra, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isEmitra) return <Navigate to="/login" />;

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/admin') ||
                     location.pathname.startsWith('/emitra-dashboard') ||
                     location.pathname.startsWith('/emitra/payment') ||
                     location.pathname.startsWith('/emitra/register-student') ||
                     location.pathname === '/admin-dashboard';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emitra-register" element={<EmitraRegister />} />
          <Route path="/emitra-dashboard" element={<EmitraRoute><EmitraDashboard /></EmitraRoute>} />
          <Route path="/emitra/payment/:studentId" element={<EmitraRoute><EmitraPayment /></EmitraRoute>} />
          <Route path="/emitra/register-student" element={<EmitraRoute><Register mode="emitraStudent" /></EmitraRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/districts" element={<AdminRoute><AdminLayout><ManageDistricts /></AdminLayout></AdminRoute>} />
          <Route path="/admin/colleges" element={<AdminRoute><AdminLayout><ManageColleges /></AdminLayout></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><AdminLayout><ManageCourses /></AdminLayout></AdminRoute>} />
          <Route path="/admin/universities" element={<AdminRoute><AdminLayout><ManageUniversities /></AdminLayout></AdminRoute>} />
          <Route path="/admin/subjects" element={<AdminRoute><AdminLayout><ManageSubjects /></AdminLayout></AdminRoute>} />
          <Route path="/admin/daily-videos" element={<AdminRoute><AdminLayout><ManageDailyVideos /></AdminLayout></AdminRoute>} />
          <Route path="/admin/bulk-colleges" element={<AdminRoute><AdminLayout><BulkAddColleges /></AdminLayout></AdminRoute>} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
