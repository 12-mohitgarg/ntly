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
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, adminProfile: null, isAdmin: false, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // First check if user exists in users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          // Regular user
          setProfile(userDoc.data() as UserProfile);
          setAdminProfile(null);
          setIsAdmin(false);
          const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          });
          return () => unsubscribeProfile();
        } else {
          // Not in users collection - check if admin by email first (faster)
          if (user.email === 'admin@internmitra.com') {
            setAdminProfile({
              email: user.email,
              password: '',
              role: 'super_admin',
              fullName: 'System Administrator',
              createdAt: new Date().toISOString(),
              isActive: true
            });
            setProfile(null);
            setIsAdmin(true);
          } else {
            // Check Firestore admin/teacher document by Firebase Auth UID
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists() && adminDoc.data().isActive === true) {
              setAdminProfile({ uid: adminDoc.id, ...adminDoc.data() } as AdminProfile);
              setProfile(null);
              setIsAdmin(true);
            } else {
              setAdminProfile(null);
              setIsAdmin(false);
            }
          }
          setLoading(false);
        }
      } else {
        setProfile(null);
        setAdminProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, adminProfile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
