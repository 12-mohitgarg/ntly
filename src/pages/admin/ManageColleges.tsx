import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface District {
  id: string;
  name: string;
}

interface College {
  id: string;
  name: string;
  districtId: string;
  price: number;
}

export default function ManageColleges() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newDistrictId, setNewDistrictId] = useState('');
  const [newPrice, setNewPrice] = useState('1000');

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
    if (!confirm('Are you sure you want to delete this college?')) return;

    try {
      await deleteDoc(doc(db, 'colleges', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting college:', error);
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
            <h1 className="text-2xl font-black tracking-tighter">Manage Colleges</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Add New College Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-4">Add New College</h2>
          <form onSubmit={handleAdd} className="flex gap-4">
            <div className="flex-1">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">College Name</Label>
              <Input
                type="text"
                value={newCollegeName}
                onChange={(e) => setNewCollegeName(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Enter college name"
              />
            </div>
            <div className="w-64">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">Select District</Label>
              <select
                value={newDistrictId}
                onChange={(e) => setNewDistrictId(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold"
                required
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 mb-2 block">Price (₹)</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="1000"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl mt-6">
              <Plus size={20} />
              Add
            </Button>
          </form>
        </div>

        {/* Colleges List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">All Colleges ({colleges.length})</h2>
          </div>

          {colleges.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold">No colleges found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {colleges.map((college) => (
                <div key={college.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {editingId === college.id ? (
                    <div className="flex items-center gap-4 flex-1">
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-10 rounded-xl flex-1"
                      />
                      <select
                        value={editDistrictId}
                        onChange={(e) => setEditDistrictId(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 px-4 font-bold w-48"
                      >
                        {districts.map(district => (
                          <option key={district.id} value={district.id}>{district.name}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="h-10 rounded-xl w-24"
                        placeholder="1000"
                      />
                      <Button onClick={() => handleSave(college.id)} className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                        <Save size={16} />
                      </Button>
                      <Button onClick={handleCancel} className="h-10 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold text-slate-900">{college.name}</span>
                        <span className="text-slate-500 text-sm ml-2">({getDistrictName(college.districtId)})</span>
                        <span className="text-blue-600 text-sm ml-2 font-bold">₹{college.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleEdit(college)} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                          <Edit2 size={16} />
                        </Button>
                        <Button onClick={() => handleDelete(college.id)} className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl">
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
