import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
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

      // If no degrees exist, initialize with DEGREES constant
      if (degreesData.length === 0) {
        await initializeDegrees();
      } else {
        setDegrees(degreesData);
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
        fetchDegrees();
      } else {
        // Create new degree if it doesn't exist
        const newDegree = {
          name: selectedDegree,
          subjects: [newSubject.trim()]
        };
        const docRef = await addDoc(collection(db, 'degrees'), newDegree);
        setNewSubject('');
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

  const handleAddSubjectInline = () => {
    setEditSubjects([...editSubjects, '']);
  };

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...editSubjects];
    updated[index] = value;
    setEditSubjects(updated);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin-dashboard')} variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-black tracking-tighter">Manage Subjects</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Add New Subject Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-4">Add New Subject</h2>
          <form onSubmit={handleAddSubject} className="flex gap-4">
            <div className="w-64">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">Select Branch</Label>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold"
                required
              >
                <option value="">Select Branch</option>
                {Object.keys(DEPARTMENTS).map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">Subject Name</Label>
              <Input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Enter subject name"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl mt-6">
              <Plus size={20} />
              Add
            </Button>
          </form>
        </div>

        {/* Degrees List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">All Degrees ({degrees.length})</h2>
          </div>

          {degrees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold">No degrees found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {degrees.map((degree) => (
                <div key={degree.id} className="p-6 hover:bg-slate-50 transition-colors">
                  {editingDegreeId === degree.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">{degree.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleSave(degree.id)} className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                            <Save size={16} />
                          </Button>
                          <Button onClick={handleCancel} className="h-10 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {editSubjects.map((subject, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={subject}
                              onChange={(e) => handleSubjectChange(index, e.target.value)}
                              className="h-10 rounded-xl flex-1"
                              placeholder="Subject name"
                            />
                            <Button onClick={() => handleRemoveSubject(index)} className="h-10 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                        <Button onClick={handleAddSubjectInline} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
                          <Plus size={16} className="mr-2" />
                          Add Subject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900 mb-2">{degree.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {degree.subjects.length > 0 ? (
                            degree.subjects.map((subject, index) => (
                              <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">
                                {subject}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-sm italic">No subjects added</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button onClick={() => handleEdit(degree)} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                          <Edit2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
