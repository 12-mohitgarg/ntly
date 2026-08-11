import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../components/AuthContext';
import { Copy, KeyRound, Plus, Trash2, Edit2, Save, X, Search, Filter, GraduationCap, Building2, ChevronDown, Check, Eye, EyeOff, MoreVertical } from 'lucide-react';

interface District {
  id: string;
  name: string;
}

interface College {
  id: string;
  name: string;
  districtId: string;
  price: number;
  createdAt?: string;
  hasCredentials?: boolean;
  generatedEmail?: string;
  generatedPassword?: string;
  credentialsGeneratedAt?: string;
}

interface GeneratedLogin {
  collegeName: string;
  email: string;
  password: string;
}

function makeCollegeEmail(collegeId: string, collegeName: string) {
  const base = String(collegeName || collegeId || 'college')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 34) || 'college';
  const suffix = String(collegeId || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 8);
  return `college-${base}${suffix ? `-${suffix}` : ''}@internmitra.com`;
}

function makePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let password = 'IM';
  for (let i = 0; i < 10; i += 1) {
    password += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return password;
}

export default function ManageColleges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [collegeUsersMap, setCollegeUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newDistrictId, setNewDistrictId] = useState('');
  const [newPrice, setNewPrice] = useState('1000');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [generatingCollegeId, setGeneratingCollegeId] = useState<string | null>(null);
  const [generatedLogin, setGeneratedLogin] = useState<GeneratedLogin | null>(null);
  const [openActionsMenuId, setOpenActionsMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const menuRef = useRef<HTMLDivElement>(null);

  // Close Actions menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenActionsMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch districts
      const districtsRef = collection(db, 'districts');
      const districtsQuery = query(districtsRef, orderBy('name'));
      const districtsSnapshot = await getDocs(districtsQuery);
      const districtsData = districtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
      setDistricts(districtsData);

      // Fetch colleges
      const collegesRef = collection(db, 'colleges');
      const collegesSnapshot = await getDocs(collegesRef);
      const collegesData = collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
      setColleges(collegesData);

      // Fetch existing collegeUsers login accounts
      const collegeUsersSnap = await getDocs(collection(db, 'collegeUsers')).catch(() => null);
      const usersMap: Record<string, any> = {};
      if (collegeUsersSnap) {
        collegeUsersSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.collegeId) {
            usersMap[data.collegeId] = { uid: doc.id, ...data };
          }
        });
      }
      setCollegeUsersMap(usersMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district?.name || 'Unknown';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName.trim() || !newDistrictId) return;

    try {
      await addDoc(collection(db, 'colleges'), {
        name: newCollegeName.trim(),
        districtId: newDistrictId,
        price: parseInt(newPrice) || 1000,
        createdAt: new Date().toISOString()
      });
      setNewCollegeName('');
      setNewDistrictId('');
      setNewPrice('1000');
      fetchData();
    } catch (error) {
      console.error('Error adding college:', error);
    }
  };

  const handleEdit = (college: College) => {
    setEditingId(college.id);
    setEditName(college.name);
    setEditDistrictId(college.districtId);
    setEditPrice(college.price.toString());
    setOpenActionsMenuId(null);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'colleges', id), {
        name: editName.trim(),
        districtId: editDistrictId,
        price: parseInt(editPrice) || 1000
      });
      setEditingId(null);
      setEditName('');
      setEditDistrictId('');
      setEditPrice('');
      fetchData();
    } catch (error) {
      console.error('Error updating college:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditDistrictId('');
    setEditPrice('');
  };

  const handleDelete = async (id: string) => {
    setOpenActionsMenuId(null);
    if (!confirm('Are you sure you want to delete this college?')) return;

    try {
      await deleteDoc(doc(db, 'colleges', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  const handleGenerateLogin = async (college: College) => {
    setOpenActionsMenuId(null);

    // Rule: If credentials already exist, do NOT generate again!
    const existingUser = collegeUsersMap[college.id];
    const alreadyGenerated = Boolean(college.hasCredentials || college.generatedEmail || existingUser);

    if (alreadyGenerated) {
      const email = college.generatedEmail || existingUser?.email;
      const pass = college.generatedPassword || existingUser?.password || '••••••••';
      alert(`Login credentials have already been generated for ${college.name}.\nEmail: ${email}\nPassword: ${pass}`);
      return;
    }

    setGeneratingCollegeId(college.id);
    try {
      let email = makeCollegeEmail(college.id, college.name);
      let password = makePassword();

      // Try calling backend API
      try {
        const token = user ? await user.getIdToken().catch(() => '') : '';
        const response = await fetch('/api/admin/college-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ collegeId: college.id }),
        });
        const result = await response.json().catch(() => null);

        if (response.ok && result?.email) {
          email = result.email;
          password = result.password || password;
        } else {
          throw new Error(result?.details || result?.error || 'Fallback to client creation');
        }
      } catch (httpErr) {
        console.warn('Backend API call failed, creating login directly in Firestore:', httpErr);
        // Fallback: save to Firestore collegeUsers collection
        const now = new Date().toISOString();
        const collegeUserRef = doc(collection(db, 'collegeUsers'));
        await setDoc(collegeUserRef, {
          collegeId: college.id,
          collegeName: college.name,
          districtId: college.districtId,
          email,
          password,
          role: 'college',
          isActive: true,
          createdAt: now,
          updatedAt: now
        });
      }

      // Update college document with credential fields in Firestore
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'colleges', college.id), {
        hasCredentials: true,
        generatedEmail: email,
        generatedPassword: password,
        credentialsGeneratedAt: now
      }).catch(async () => {
        await setDoc(doc(db, 'colleges', college.id), {
          hasCredentials: true,
          generatedEmail: email,
          generatedPassword: password,
          credentialsGeneratedAt: now
        }, { merge: true });
      });

      // Update local state immediately
      setColleges(prev => prev.map(c => c.id === college.id ? {
        ...c,
        hasCredentials: true,
        generatedEmail: email,
        generatedPassword: password
      } : c));

      setCollegeUsersMap(prev => ({
        ...prev,
        [college.id]: { collegeId: college.id, email, password }
      }));

      setGeneratedLogin({
        collegeName: college.name,
        email,
        password,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error generating college login:', error);
      alert(error?.message || 'Unable to generate college login');
    } finally {
      setGeneratingCollegeId(null);
    }
  };

  const copyText = async (value: string, idStr?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      if (idStr) {
        setCopiedId(idStr);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        alert('Copied to clipboard!');
      }
    } catch {
      alert(value);
    }
  };

  const toggleShowPassword = (collegeId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [collegeId]: !prev[collegeId] }));
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDistrictName(college.districtId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const currentItems = filteredColleges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading Colleges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans select-none">
      
      {/* Generated Credentials Modal Dialog */}
      <Dialog open={Boolean(generatedLogin)} onOpenChange={(open) => !open && setGeneratedLogin(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full inline-block">
              Credentials Generated
            </span>
            <DialogTitle className="text-xl font-black text-slate-900">
              College Login Generated
            </DialogTitle>
            <DialogDescription className="font-semibold text-xs text-slate-500">
              Share these credentials with <strong>{generatedLogin?.collegeName}</strong> to access the college portal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs">
              <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-500">Login ID / Email</div>
              <div className="flex items-center justify-between gap-3">
                <span className="break-all text-xs font-black text-slate-900">{generatedLogin?.email}</span>
                <Button
                  type="button"
                  onClick={() => generatedLogin?.email && copyText(generatedLogin.email)}
                  className="h-8 rounded-xl bg-white px-3 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-xs font-bold shrink-0 cursor-pointer"
                >
                  <Copy size={13} />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
              <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-blue-600">Password</div>
              <div className="flex items-center justify-between gap-3">
                <span className="break-all text-xs font-black text-slate-900">{generatedLogin?.password}</span>
                <Button
                  type="button"
                  onClick={() => generatedLogin?.password && copyText(generatedLogin.password)}
                  className="h-8 rounded-xl bg-white px-3 text-slate-700 ring-1 ring-blue-100 hover:bg-blue-50 text-xs font-bold shrink-0 cursor-pointer"
                >
                  <Copy size={13} />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 flex justify-between items-center">
            <Button
              type="button"
              onClick={() => generatedLogin && copyText(`College: ${generatedLogin.collegeName}\nLogin ID: ${generatedLogin.email}\nPassword: ${generatedLogin.password}`)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 text-xs font-black uppercase tracking-wider text-white h-11 shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Copy size={14} />
              <span>Copy Both Credentials</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1. Add New College Card (Matching UI Screenshot) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add New College</h2>
            <p className="text-xs font-semibold text-slate-500">Register new degree or vocational college into Bihar database.</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1">
          
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">College Name *</Label>
            <Input
              type="text"
              value={newCollegeName}
              onChange={(e) => setNewCollegeName(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner"
              placeholder="Enter college name"
              required
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select District *</Label>
            <select
              value={newDistrictId}
              onChange={(e) => setNewDistrictId(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition shadow-inner cursor-pointer"
              required
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Price (₹) *</Label>
            <Input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-blue-500 transition shadow-inner"
              placeholder="1000"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add College</span>
            </Button>
          </div>

        </form>
      </div>

      {/* 2. All Colleges Table Card (Matching UI Screenshot) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header Title & Search/Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            All Colleges ({filteredColleges.length})
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search college name..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="h-10 px-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-100 transition cursor-pointer"
              >
                <Filter size={14} className="text-blue-600" />
                <span>Filters</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredColleges.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xs">No colleges matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">COLLEGE NAME</th>
                  <th className="py-3.5 px-4">DISTRICT</th>
                  <th className="py-3.5 px-4">PRICE (₹)</th>
                  <th className="py-3.5 px-4">ADDED ON</th>
                  <th className="py-3.5 px-4">LOGIN CREDENTIALS</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {currentItems.map((college) => {
                  const collegeUser = collegeUsersMap[college.id];
                  const email = college.generatedEmail || collegeUser?.email;

                  // Get actual password if saved, or construct standard password string
                  const rawPassword = college.generatedPassword || collegeUser?.password;
                  const password = rawPassword || (college.hasCredentials || collegeUser ? 'IM' + college.id.slice(0, 8).toUpperCase() : '');
                  const hasCreds = Boolean(college.hasCredentials || college.generatedEmail || collegeUser || email);
                  const isPasswordVisible = Boolean(showPasswordMap[college.id]);

                  return (
                    <tr key={college.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* College Name */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {editingId === college.id ? (
                          <Input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10 text-xs rounded-xl bg-white border-slate-200"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                              <Building2 size={16} />
                            </div>
                            <span className="font-extrabold text-slate-900">{college.name}</span>
                          </div>
                        )}
                      </td>

                      {/* District */}
                      <td className="py-4 px-4">
                        {editingId === college.id ? (
                          <select
                            value={editDistrictId}
                            onChange={(e) => setEditDistrictId(e.target.value)}
                            className="h-10 px-3 text-xs rounded-xl bg-white border border-slate-200 font-bold"
                          >
                            <option value="">Select District</option>
                            {districts.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-block">
                            {getDistrictName(college.districtId)}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-black text-emerald-600">
                        {editingId === college.id ? (
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-10 text-xs rounded-xl bg-white border-slate-200 w-24"
                          />
                        ) : (
                          <span>₹{college.price}</span>
                        )}
                      </td>

                      {/* Added On Date */}
                      <td className="py-4 px-4 text-slate-400 font-medium text-xs">
                        {college.createdAt
                          ? new Date(college.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '28 Jul 2026'}
                      </td>

                      {/* LOGIN CREDENTIALS Column */}
                      <td className="py-4 px-4 min-w-[260px]">
                        {hasCreds && email ? (
                          <div className="flex items-center justify-between gap-3 bg-blue-50/60 border border-blue-100 px-3.5 py-2.5 rounded-2xl shadow-2xs">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="text-[11px] font-black text-slate-900 flex items-start gap-1.5 leading-snug">
                                <span className="text-[9px] text-blue-600 uppercase font-black shrink-0 mt-0.5">ID:</span>
                                <span className="break-all font-mono font-bold text-slate-900 select-all">{email}</span>
                              </div>
                              <div className="text-[11px] font-extrabold text-indigo-900 flex items-center gap-1.5 leading-snug">
                                <span className="text-[9px] text-indigo-500 uppercase font-black shrink-0">PASS:</span>
                                <span className="font-mono text-slate-900 break-all">{isPasswordVisible ? password : '••••••••••••'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-center">
                              {/* Password Eye Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleShowPassword(college.id)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition cursor-pointer"
                                title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>

                              {/* Copy Credentials Button */}
                              <button
                                type="button"
                                onClick={() => copyText(`Login ID: ${email}\nPassword: ${password}`, college.id)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white transition cursor-pointer"
                                title="Copy Credentials"
                              >
                                {copiedId === college.id ? <Check size={14} className="text-emerald-600 font-bold" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">
                            Not Generated
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {editingId === college.id ? (
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleSave(college.id)} className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                              <Save size={14} />
                            </Button>
                            <Button onClick={handleCancel} className="h-9 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div
                            ref={openActionsMenuId === college.id ? menuRef : null}
                            className="relative inline-block text-left"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenActionsMenuId(openActionsMenuId === college.id ? null : college.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="Actions"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Options Menu */}
                            {openActionsMenuId === college.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-left space-y-1">
                                
                                {/* Rule: Once login credentials exist, DISABLE the button so admin cannot generate again! */}
                                <button
                                  type="button"
                                  disabled={hasCreds || generatingCollegeId === college.id}
                                  onClick={() => handleGenerateLogin(college)}
                                  className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                                    hasCreds
                                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-60'
                                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
                                  }`}
                                  title={hasCreds ? 'Login credentials already generated' : 'Generate college login'}
                                >
                                  <KeyRound size={14} className={hasCreds ? 'text-slate-400' : 'text-blue-600'} />
                                  <span>{hasCreds ? 'Generated ✓' : generatingCollegeId === college.id ? 'Generating...' : 'Login'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEdit(college)}
                                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Edit2 size={14} className="text-slate-500" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(college.id)}
                                  className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Trash2 size={14} className="text-rose-500" />
                                  <span>Delete</span>
                                </button>

                              </div>
                            )}
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div>
              Showing {filteredColleges.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredColleges.length)} of {filteredColleges.length} entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .map((p, idx, arr) => {
                  const prevVal = arr[idx - 1];
                  const showDots = prevVal && p - prevVal > 1;
                  return (
                    <React.Fragment key={p}>
                      {showDots && <span className="px-1 text-slate-400 font-bold">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`h-9 w-9 rounded-xl text-xs font-black transition cursor-pointer ${
                          currentPage === p
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
