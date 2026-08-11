import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface District {
  id: string;
  name: string;
}

export default function ManageDistricts() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const districtsRef = collection(db, 'districts');
      const q = query(districtsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const districtsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;

    try {
      await addDoc(collection(db, 'districts'), {
        name: newDistrictName.trim(),
        createdAt: new Date().toISOString()
      });
      setNewDistrictName('');
      fetchDistricts();
    } catch (error) {
      console.error('Error adding district:', error);
    }
  };

  const handleEdit = (district: District) => {
    setEditingId(district.id);
    setEditName(district.name);
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateDoc(doc(db, 'districts', id), {
        name: editName.trim()
      });
      setEditingId(null);
      setEditName('');
      fetchDistricts();
    } catch (error) {
      console.error('Error updating district:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this district?')) return;

    try {
      await deleteDoc(doc(db, 'districts', id));
      fetchDistricts();
    } catch (error) {
      console.error('Error deleting district:', error);
    }
  };

  // Search & Filter
  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalEntries = filteredDistricts.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDistricts = filteredDistricts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading districts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none animate-fade-in">
      
      {/* 1. TOP HERO BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-inner">
            <MapPin size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Districts
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Add, view and manage all districts.
            </p>
          </div>
        </div>

        {/* City Skyline Banner Graphic */}
        <div className="hidden md:flex items-center justify-end z-10 shrink-0">
          <div className="relative">
            <svg viewBox="0 0 240 60" className="w-64 h-16 text-blue-100 fill-current">
              <path d="M0,60 L0,45 L15,45 L15,30 L25,30 L25,45 L40,45 L40,20 L55,20 L55,45 L70,45 L70,10 L85,10 L85,45 L100,45 L100,25 L115,25 L115,45 L130,45 L130,15 L145,15 L145,45 L160,45 L160,35 L175,35 L175,45 L190,45 L190,20 L205,20 L205,45 L220,45 L220,30 L240,30 L240,60 Z" />
            </svg>
            <div className="absolute top-1 right-8 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-white animate-bounce">
              <MapPin size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADD NEW DISTRICT CARD */}
      <div className="bg-blue-50/50 border border-blue-150 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 tracking-tight">Add New District</h2>
        
        <form onSubmit={handleAdd} className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">District Name</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              placeholder="Enter district name"
              className="flex-1 h-12 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 transition shadow-2xs"
            />
            <Button
              type="submit"
              className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>Add District</span>
            </Button>
          </div>
        </form>
      </div>

      {/* 3. ALL DISTRICTS LISTING TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              All Districts ({districts.length})
            </h3>
            <p className="text-xs font-semibold text-slate-450 mt-0.5">Comprehensive list of all registered districts</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search districts..."
                className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs transition"
              />
            </div>

            <button
              type="button"
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition shrink-0 cursor-pointer"
            >
              <Filter size={15} />
            </button>
          </div>
        </div>

        {/* Table Listing */}
        {paginatedDistricts.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center">
            <MapPin size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No districts found</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">Add a new district using the input form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-3 px-4 w-16">#</th>
                  <th className="pb-3 px-4">District Name</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {paginatedDistricts.map((district, idx) => {
                  const num = startIndex + idx + 1;
                  const isEditing = editingId === district.id;

                  return (
                    <tr key={district.id} className="hover:bg-slate-50/60 transition">
                      {/* Index */}
                      <td className="py-3.5 px-4 font-bold text-slate-400">{num}</td>

                      {/* District Name or Inline Edit */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold text-slate-900 bg-white"
                            />
                            <button
                              onClick={() => handleSave(district.id)}
                              className="h-8 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 cursor-pointer"
                            >
                              <Save size={13} />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancel}
                              className="h-8 px-3 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-300 cursor-pointer"
                            >
                              <X size={13} />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <span>{district.name}</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {!isEditing && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(district)}
                              className="h-8 px-3.5 rounded-xl border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 font-bold text-[11px] inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDelete(district.id)}
                              className="h-8 px-3.5 rounded-xl border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 font-bold text-[11px] inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
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

        {/* Footer Pagination */}
        {totalEntries > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalEntries)} of {totalEntries} districts
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
