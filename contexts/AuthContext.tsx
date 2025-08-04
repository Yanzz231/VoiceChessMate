import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { authService, UserData } from "@/services/authService";
import { auth, firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(firestore, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
            });
          }

          const saved = await authService.saveAuthData(firebaseUser);
          setUserData(saved);
        } catch (error) {
          console.error("Error saving auth data:", error);
        }
      } else {
        await authService.clearAuthData();
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setUserData(null);
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
