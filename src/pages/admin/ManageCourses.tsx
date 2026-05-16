import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
}

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

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
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteDoc(doc(db, 'courses', id));
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
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
            <h1 className="text-2xl font-black tracking-tighter">Manage Courses</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Add New Course Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-4">Add New Course</h2>
          <form onSubmit={handleAdd} className="flex gap-4">
            <div className="flex-1">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">Course Name</Label>
              <Input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Enter course name"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl mt-6">
              <Plus size={20} />
              Add
            </Button>
          </form>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">All Courses ({courses.length})</h2>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold">No courses found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {courses.map((course) => (
                <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {editingId === course.id ? (
                    <div className="flex items-center gap-4 flex-1">
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-10 rounded-xl flex-1"
                      />
                      <Button onClick={() => handleSave(course.id)} className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                        <Save size={16} />
                      </Button>
                      <Button onClick={handleCancel} className="h-10 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-900">{course.name}</span>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleEdit(course)} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                          <Edit2 size={16} />
                        </Button>
                        <Button onClick={() => handleDelete(course.id)} className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
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
