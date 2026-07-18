import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebase';

interface AdminProfile {
  uid?: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
  createdAt: string;
  isActive: boolean;
  course?: string;
}

interface EmitraProfile {
  uid?: string;
  centerName: string;
  ownerName: string;
  email: string;
  contactNumber: string;
  address: string;
  commissionPercentage: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  adminProfile: AdminProfile | null;
  emitraProfile: EmitraProfile | null;
  isAdmin: boolean;
  isEmitra: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  adminProfile: null,
  emitraProfile: null,
  isAdmin: false,
  isEmitra: false,
  loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [emitraProfile, setEmitraProfile] = useState<EmitraProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmitra, setIsEmitra] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      setLoading(true);
      setUser(user);
      setProfile(null);
      setAdminProfile(null);
      setEmitraProfile(null);
      setIsAdmin(false);
      setIsEmitra(false);
      if (user) {
        if (user.email === 'admin@internmitra.com') {
          setAdminProfile({
            email: user.email,
            password: '',
            role: 'super_admin',
            fullName: 'System Administrator',
            createdAt: new Date().toISOString(),
            isActive: true
          });
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const [adminDoc, emitraDoc, userDoc] = await Promise.all([
          getDoc(doc(db, 'admins', user.uid)).catch((error) => {
            console.warn('Admin profile lookup failed:', error);
            return null;
          }),
          getDoc(doc(db, 'emitras', user.uid)).catch((error) => {
            console.warn('Cyber cafe profile lookup failed:', error);
            return null;
          }),
          getDoc(doc(db, 'users', user.uid)).catch((error) => {
            console.warn('User profile lookup failed:', error);
            return null;
          })
        ]);

        if (adminDoc?.exists() && adminDoc.data().isActive === true) {
          setAdminProfile({ uid: adminDoc.id, ...adminDoc.data() } as AdminProfile);
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        if (emitraDoc?.exists() && emitraDoc.data().isActive === true) {
          setEmitraProfile({ uid: emitraDoc.id, ...emitraDoc.data() } as EmitraProfile);
          setIsEmitra(true);
          setLoading(false);
          return;
        }

        if (userDoc?.exists()) {
          setProfile(userDoc.data() as UserProfile);
          unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }, (error) => {
            console.error('User profile subscription failed:', error);
            setLoading(false);
          });
          return;
        }

        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, adminProfile, emitraProfile, isAdmin, isEmitra, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
