import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BookOpen, Plus, Trash2, Edit2, Save, X, Search, Filter, ChevronDown, GraduationCap, Calendar, Check, MoreVertical } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  createdAt?: string;
  isActive?: boolean;
}

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  
  // Filter & Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a' | 'newest'>('a-z');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close Actions menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    try {
      await addDoc(collection(db, 'courses'), {
        name: newCourseName.trim(),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewCourseName('');
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setEditName(course.name);
    setOpenActionMenuId(null);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'courses', id), {
        name: editName.trim()
      });
      setEditingId(null);
      setEditName('');
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string) => {
    setOpenActionMenuId(null);
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteDoc(doc(db, 'courses', id));
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // Filter & Sort Courses
  const filteredCourses = courses
    .filter(course => course.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'a-z') return a.name.localeCompare(b.name);
      if (sortOrder === 'z-a') return b.name.localeCompare(a.name);
      if (sortOrder === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentItems = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading Courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans select-none pb-10">
      
      {/* 1. Add New Course Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add New Course</h2>
            <p className="text-xs font-semibold text-slate-500">Add a new academic course or degree program to the database.</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end pt-1">
          <div className="flex-1 w-full space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Course Name *</Label>
            <Input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner"
              placeholder="e.g. B.Tech Computer Science & Engineering"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </Button>
        </form>

      </div>

      {/* 2. All Courses Table & Search & Pagination Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header Title & Search / Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            All Courses ({filteredCourses.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
                placeholder="Search course name..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
              />
            </div>

            {/* Sort Order Selector */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-10 px-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 cursor-pointer appearance-none pr-8"
              >
                <option value="a-z">Sort: A to Z</option>
                <option value="z-a">Sort: Z to A</option>
                <option value="newest">Sort: Newest First</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table View */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xs">No courses matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">COURSE NAME</th>
                  <th className="py-3.5 px-4">ADDED ON</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {currentItems.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Course Name */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {editingId === course.id ? (
                        <Input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-10 text-xs rounded-xl bg-white border-slate-200"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                            <BookOpen size={16} />
                          </div>
                          <span className="font-extrabold text-slate-900">{course.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Added On Date */}
                    <td className="py-4 px-4 text-slate-400 font-medium text-xs">
                      {course.createdAt
                        ? new Date(course.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '01 Aug 2026'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        ACTIVE
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {editingId === course.id ? (
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleSave(course.id)} className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                            <Save size={14} />
                          </Button>
                          <Button onClick={handleCancel} className="h-9 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div
                          ref={openActionMenuId === course.id ? menuRef : null}
                          className="relative inline-block text-left"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenActionMenuId(openActionMenuId === course.id ? null : course.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Actions"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Options Menu */}
                          {openActionMenuId === course.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-left space-y-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(course)}
                                className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition cursor-pointer"
                              >
                                <Edit2 size={14} className="text-slate-500" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(course.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer (Requested by user) */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredCourses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} entries
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                ‹ Prev
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
                Next ›
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
