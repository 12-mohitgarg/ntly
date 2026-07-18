import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { AlertCircle, ArrowRight, Building2, Handshake, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const DEFAULT_COMMISSION_PERCENTAGE = 5;

export default function EmitraRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    centerName: '',
    ownerName: '',
    email: '',
    contactNumber: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const centerName = formData.centerName.trim();
    const ownerName = formData.ownerName.trim();
    const email = formData.email.trim().toLowerCase();
    const contactNumber = formData.contactNumber.trim();
    const address = formData.address.trim();

    if (!centerName || !ownerName || !email || !contactNumber || !address || !formData.password) {
      setError('Please fill all Cyber cafe details.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, formData.password);

      await setDoc(doc(db, 'emitras', credential.user.uid), {
        uid: credential.user.uid,
        centerName,
        ownerName,
        email,
        contactNumber,
        address,
        commissionPercentage: DEFAULT_COMMISSION_PERCENTAGE,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      navigate('/emitra-dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email.');
      } else {
        setError(err.message || 'Unable to register Cyber cafe.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-soft border border-slate-150/60 overflow-hidden grid md:grid-cols-[0.9fr_1.4fr]">
        <div className="bg-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Handshake size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Partner Registration</p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">Cyber cafe</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">
                Register your Cyber cafe and start adding students through the InternMitra enrollment flow.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Default Commission</p>
              <p className="mt-2 text-4xl font-black text-white">{DEFAULT_COMMISSION_PERCENTAGE}%</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Admin can adjust this percentage after registration.</p>
            </div>
          </div>
          <p className="mt-10 text-[10px] font-black uppercase tracking-widest text-slate-500">InternMitra Partner Network</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">Create Account</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 uppercase">Cyber cafe Details</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cyber cafe Name</Label>
              <div className="relative">
                <Input name="centerName" value={formData.centerName} onChange={handleChange} className="h-12 rounded-xl pl-11 bg-slate-50 border-transparent font-semibold" placeholder="e.g. Kumar Cyber cafe" />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Owner Name</Label>
              <div className="relative">
                <Input name="ownerName" value={formData.ownerName} onChange={handleChange} className="h-12 rounded-xl pl-11 bg-slate-50 border-transparent font-semibold" placeholder="Owner full name" />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email</Label>
              <div className="relative">
                <Input type="email" name="email" value={formData.email} onChange={handleChange} className="h-12 rounded-xl pl-11 bg-slate-50 border-transparent font-semibold" placeholder="center@email.com" />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Number</Label>
              <div className="relative">
                <Input name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="h-12 rounded-xl pl-11 bg-slate-50 border-transparent font-semibold" placeholder="10 digit mobile" />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cyber cafe Address</Label>
            <div className="relative">
              <textarea name="address" value={formData.address} onChange={handleChange} className="w-full min-h-24 rounded-xl bg-slate-50 border border-transparent px-11 py-3 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Full address" />
              <MapPin className="absolute left-3.5 top-4 text-slate-300" size={16} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Password</Label>
              <div className="relative">
                <Input type="password" name="password" value={formData.password} onChange={handleChange} className="h-12 rounded-xl pl-11 bg-slate-50 border-transparent font-semibold" placeholder="Minimum 6 characters" />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Confirm Password</Label>
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-transparent font-semibold" placeholder="Repeat password" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-slate-900 text-white text-xs font-black rounded-xl uppercase tracking-widest">
            {loading ? 'Creating Cyber cafe...' : 'Register Cyber cafe'}
            <ArrowRight size={14} />
          </Button>

          <p className="text-center text-sm font-semibold text-slate-400">
            Already registered? <Link to="/login" className="text-blue-600 font-black hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
