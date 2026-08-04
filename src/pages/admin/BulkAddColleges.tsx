import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Building2, MapPin, Save, HelpCircle, UserPlus, Info, Coins, ChevronDown } from 'lucide-react';

interface University {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

export default function BulkAddColleges() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<University[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [price, setPrice] = useState('1000');
  const [collegesInput, setCollegesInput] = useState('');

  // Status states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch universities
      const universitiesRef = collection(db, 'universities');
      const universitiesQuery = query(universitiesRef, orderBy('name'));
      const universitiesSnapshot = await getDocs(universitiesQuery);
      const universitiesData = universitiesSnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() } as University)
      );
      setUniversities(universitiesData);

      // Fetch districts
      const districtsRef = collection(db, 'districts');
      const districtsQuery = query(districtsRef, orderBy('name'));
      const districtsSnapshot = await getDocs(districtsQuery);
      const districtsData = districtsSnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() } as District)
      );
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setErrorMsg('Failed to load universities or districts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniversityId) {
      alert('Please select a University.');
      return;
    }
    if (!selectedDistrictId) {
      alert('Please select a District.');
      return;
    }
    if (!collegesInput.trim()) {
      alert('Please enter at least one college name.');
      return;
    }

    // Split input by newlines only (commas in college names are preserved)
    const lines = collegesInput.split(/\r?\n/);
    const collegeNames = lines
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (collegeNames.length === 0) {
      alert('Please enter valid college names.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let addedCount = 0;
      const CHUNK_SIZE = 400; // safe chunk size for write batches (Firestore limit is 500)

      for (let i = 0; i < collegeNames.length; i += CHUNK_SIZE) {
        const chunk = collegeNames.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach(name => {
          const newDocRef = doc(collection(db, 'colleges'));
          batch.set(newDocRef, {
            name,
            districtId: selectedDistrictId,
            universityId: selectedUniversityId,
            price: parseInt(price) || 1000,
            createdAt: new Date().toISOString(),
          });
        });

        await batch.commit();
        addedCount += chunk.length;
      }

      setSuccessMsg(`Successfully added ${addedCount} colleges in bulk!`);
      setCollegesInput('');
    } catch (error: any) {
      console.error('Error bulk adding colleges:', error);
      setErrorMsg(error.message || 'Error occurred while saving colleges.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading Setup Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans select-none max-w-5xl mx-auto pb-10">
      
      {/* Header Bar (Matching UI Screenshot) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/colleges')}
            className="h-10 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-2xs transition active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Back to Colleges</span>
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <UserPlus size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Bulk Add Colleges
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Add multiple colleges to a university and district at once.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveBulk} className="space-y-6">
        
        {/* Top Card: Dropdowns & Default Price (Matching UI Screenshot) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Select University */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <Building2 size={14} className="text-blue-600" />
                <span>SELECT UNIVERSITY <span className="text-rose-500">*</span></span>
              </div>
              <div className="relative">
                <select
                  value={selectedUniversityId}
                  onChange={(e) => setSelectedUniversityId(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner cursor-pointer appearance-none"
                  required
                >
                  <option value="">Choose University</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Select District */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <MapPin size={14} className="text-blue-600" />
                <span>SELECT DISTRICT <span className="text-rose-500">*</span></span>
              </div>
              <div className="relative">
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner cursor-pointer appearance-none"
                  required
                >
                  <option value="">Choose District</option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Price input */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <Coins size={14} className="text-blue-600" />
                <span>PRICE (₹) <span className="text-rose-500">*</span></span>
              </div>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 rounded-2xl bg-slate-50/70 border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-inner"
                placeholder="1000"
                required
              />
            </div>

          </div>
        </div>

        {/* Bottom Card: Colleges List Textarea & Info Alert (Matching UI Screenshot) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                COLLEGES LIST <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={12} />
                Separate by new lines
              </span>
            </div>

            <div className="relative">
              <textarea
                value={collegesInput}
                onChange={(e) => setCollegesInput(e.target.value)}
                placeholder="Example:&#10;Government College of Technology&#10;Indira Gandhi Science College, Mahatma Gandhi Institute of Technology&#10;State Engineering College"
                className="w-full min-h-[220px] p-5 rounded-2xl bg-slate-50/50 border border-slate-200/90 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs text-slate-800 placeholder-slate-400 outline-none leading-relaxed resize-none shadow-inner"
                required
              />
              <div className="absolute right-4 bottom-4 text-[10px] font-bold text-slate-400 font-mono">
                {collegesInput.length} / 2000
              </div>
            </div>
          </div>

          {/* Info Alert Box (Matching UI Screenshot) */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-blue-900 shadow-2xs">
            <Info size={18} className="text-blue-600 shrink-0" />
            <span>You can enter multiple college names separated by commas or new lines.</span>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-extrabold">
              {errorMsg}
            </div>
          )}

        </div>

        {/* Submit button (Matching UI Screenshot) */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Colleges...' : 'Save All Colleges'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
