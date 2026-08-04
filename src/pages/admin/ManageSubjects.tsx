import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BookOpen, Plus, Trash2, Edit2, Save, X, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { DEPARTMENTS } from '../../lib/constants';

interface Degree {
  id: string;
  name: string;
  subjects: string[];
}

export default function ManageSubjects() {
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDegreeId, setEditingDegreeId] = useState<string | null>(null);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [activeTabDegree, setActiveTabDegree] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const degreesRef = collection(db, 'degrees');
      const q = query(degreesRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const degreesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Degree));

      // If no degrees exist, initialize with DEPARTMENTS constant
      if (degreesData.length === 0) {
        await initializeDegrees();
      } else {
        setDegrees(degreesData);
        if (!activeTabDegree && degreesData.length > 0) {
          setActiveTabDegree(degreesData[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching degrees:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDegrees = async () => {
    try {
      const initialDegrees = Object.keys(DEPARTMENTS).map(degree => ({
        name: degree,
        subjects: []
      }));

      for (const degree of initialDegrees) {
        await addDoc(collection(db, 'degrees'), degree);
      }
      fetchDegrees();
    } catch (error) {
      console.error('Error initializing degrees:', error);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDegree || !newSubject.trim()) return;

    try {
      const degree = degrees.find(d => d.name === selectedDegree);
      if (degree) {
        const updatedSubjects = [...degree.subjects, newSubject.trim()];
        await updateDoc(doc(db, 'degrees', degree.id), {
          subjects: updatedSubjects
        });
        setNewSubject('');
        setActiveTabDegree(degree.name);
        fetchDegrees();
      } else {
        // Create new degree if it doesn't exist
        const newDegree = {
          name: selectedDegree,
          subjects: [newSubject.trim()]
        };
        await addDoc(collection(db, 'degrees'), newDegree);
        setNewSubject('');
        setActiveTabDegree(selectedDegree);
        fetchDegrees();
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleEdit = (degree: Degree) => {
    setEditingDegreeId(degree.id);
    setEditSubjects([...degree.subjects]);
  };

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, 'degrees', id), {
        subjects: editSubjects.filter(s => s.trim() !== '')
      });
      setEditingDegreeId(null);
      setEditSubjects([]);
      fetchDegrees();
    } catch (error) {
      console.error('Error updating subjects:', error);
    }
  };

  const handleCancel = () => {
    setEditingDegreeId(null);
    setEditSubjects([]);
  };

  const handleRemoveSubject = (index: number) => {
    const updated = editSubjects.filter((_, i) => i !== index);
    setEditSubjects(updated);
  };

  const handleDeleteSubject = async (degree: Degree, index: number) => {
    const subjectName = degree.subjects[index];
    if (!confirm(`Are you sure you want to delete "${subjectName}" from ${degree.name}?`)) return;

    try {
      const updatedSubjects = degree.subjects.filter((_, subjectIndex) => subjectIndex !== index);
      await updateDoc(doc(db, 'degrees', degree.id), {
        subjects: updatedSubjects
      });
      fetchDegrees();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleDeleteDegree = async (degree: Degree) => {
    if (!confirm(`Are you sure you want to delete "${degree.name}" and all of its subjects?`)) return;

    try {
      await deleteDoc(doc(db, 'degrees', degree.id));
      fetchDegrees();
    } catch (error) {
      console.error('Error deleting degree:', error);
    }
  };

  const handleAddSubjectInline = () => {
    setEditSubjects([...editSubjects, '']);
  };

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...editSubjects];
    updated[index] = value;
    setEditSubjects(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading subjects...</span>
        </div>
      </div>
    );
  }

  const currentDegree = degrees.find(d => d.name === activeTabDegree) || degrees[0];

  return (
    <div className="space-y-8 text-left font-sans select-none pb-10">
      
      {/* 1. Add New Subject Form Card (Matching UI Screenshot) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add New Subject</h2>
            <p className="text-xs font-semibold text-slate-500">Add a new subject under the selected department.</p>
          </div>
        </div>

        <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1">
          
          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select Department *</Label>
            <div className="relative">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition shadow-inner cursor-pointer appearance-none"
                required
              >
                <option value="">Select Department</option>
                {Object.keys(DEPARTMENTS).map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-6 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Subject Name *</Label>
            <Input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-500 transition shadow-inner"
              placeholder="Enter subject name"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add Subject</span>
            </Button>
          </div>

        </form>
      </div>

      {/* 2. All Degrees Pills Filter & Subjects Section (Matching UI Screenshot) */}
      <div className="space-y-6">
        
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              All Degrees ({degrees.length})
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Subjects listed by degree and department
            </p>
          </div>

          {/* Degree Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {degrees.map((deg) => {
              const isActive = activeTabDegree === deg.name;
              return (
                <button
                  key={deg.id}
                  type="button"
                  onClick={() => setActiveTabDegree(deg.name)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap size={15} className={isActive ? 'text-white' : 'text-blue-600'} />
                  <span>{deg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Degree Card with Subject Chips Grid */}
        {currentDegree && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Card Header: Degree Name & Action Buttons */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {currentDegree.name} Subjects
              </h3>

              {editingDegreeId !== currentDegree.id ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(currentDegree)}
                    className="h-9 px-4 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDegree(currentDegree)}
                    className="h-9 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleSave(currentDegree.id)} className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold">
                    <Save size={14} />
                    <span>Save</span>
                  </Button>
                  <Button onClick={handleCancel} className="h-9 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold">
                    <X size={14} />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Edit Mode View */}
            {editingDegreeId === currentDegree.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {editSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                      <Input
                        type="text"
                        value={subject}
                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                        className="h-10 text-xs font-semibold rounded-xl bg-white border-slate-200 flex-1"
                        placeholder="Subject name"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddSubjectInline}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Subject Field</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode: Subject Chips Grid (5 columns on desktop) */
              currentDegree.subjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400">No subjects added under {currentDegree.name} yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {currentDegree.subjects.map((subject, index) => (
                    <div
                      key={`${subject}-${index}`}
                      className="bg-white border border-slate-200/90 hover:border-blue-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <BookOpen size={15} />
                        </div>
                        <span className="text-xs font-black text-slate-900 truncate">{subject}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(currentDegree, index)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                        title={`Delete ${subject}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}
