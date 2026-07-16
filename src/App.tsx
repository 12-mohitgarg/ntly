/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';
import ManageDistricts from './pages/admin/ManageDistricts';
import ManageColleges from './pages/admin/ManageColleges';
import ManageCourses from './pages/admin/ManageCourses';
import ManageUniversities from './pages/admin/ManageUniversities';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageDailyVideos from './pages/admin/ManageDailyVideos';
import BulkAddColleges from './pages/admin/BulkAddColleges';
import Notifications from "./pages/dashboard/Notifications";
import AdminLayout from './components/AdminLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
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

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/admin') ||
                     location.pathname === '/admin-dashboard';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
