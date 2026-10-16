/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  signInAsGuest as fbSignInAsGuest,
  onAuthStateChanged,
  FirebaseUser,
} from '../services/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  userPhone: string;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInAsGuest: () => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  canViewCosts: boolean;
  canAdjustInventory: boolean;
  canAccessPOS: boolean;
  canViewReports: boolean;
  canManageProcurement: boolean;
  canManageDispatch: boolean;
  canManageReturns: boolean;
  posPasscodeVerified: boolean;
  verifyPOSPasscode: (pin: string) => boolean;
  logoutPOS: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('vastrika_active_role') as UserRole) || 'OWNER_ADMIN';
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [posPasscodeVerified, setPosPasscodeVerified] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('vastrika_active_role', role);
  }, [role]);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      if (currentUser?.email === 'ashish.4u89@gmail.com') {
        setRoleState('OWNER_ADMIN');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    try {
      setIsLoading(true);
      const signedInUser = await fbSignInWithGoogle();
      if (signedInUser?.email === 'ashish.4u89@gmail.com') {
        setRoleState('OWNER_ADMIN');
      }
      return signedInUser;
    } catch (err) {
      console.warn('Google sign-in attempt:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async (): Promise<FirebaseUser | null> => {
    try {
      setIsLoading(true);
      const guestUser = await fbSignInAsGuest();
      return guestUser;
    } catch (err) {
      console.warn('Guest sign-in attempt:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await fbSignOutUser();
      setUser(null);
    } catch (err) {
      console.error('Error during sign-out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole !== 'BILLING_OPERATOR' && newRole !== 'STORE_MANAGER' && newRole !== 'OWNER_ADMIN') {
      setPosPasscodeVerified(false);
    }
  };

  const verifyPOSPasscode = (pin: string): boolean => {
    // POS terminal PIN (default 1234 or 2026)
    if (pin === '1234' || pin === '2026' || role === 'OWNER_ADMIN') {
      setPosPasscodeVerified(true);
      return true;
    }
    return false;
  };

  const logoutPOS = () => {
    setPosPasscodeVerified(false);
  };

  const canViewCosts = role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'PURCHASE_MANAGER';
  const canAdjustInventory =
    role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'INVENTORY_OPERATOR' || role === 'PURCHASE_MANAGER';
  const canAccessPOS =
    role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'BILLING_OPERATOR';
  const canViewReports = role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'PURCHASE_MANAGER';
  const canManageProcurement = role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'PURCHASE_MANAGER';
  const canManageDispatch = role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'ORDER_MANAGER' || role === 'WAREHOUSE_PACKING';
  const canManageReturns = role === 'OWNER_ADMIN' || role === 'STORE_MANAGER' || role === 'ORDER_MANAGER';

  const roleNames: Record<UserRole, string> = {
    OWNER_ADMIN: user?.displayName || 'Ashish (Founder & Executive)',
    STORE_MANAGER: 'Meenakshi Iyer (Store Manager)',
    PURCHASE_MANAGER: 'Anand Kumar (Procurement Head)',
    ORDER_MANAGER: 'Vandana Rao (Fulfillment Lead)',
    WAREHOUSE_PACKING: 'Karthik Raja (Packing & Shipping)',
    BILLING_OPERATOR: 'Rohan Verma (Cashier & POS)',
    INVENTORY_OPERATOR: 'Ganesh Pillai (Warehouse In-charge)',
    CUSTOMER: user?.displayName || 'Priya Sharma (Corporate Guest)',
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser: user,
        isAuthenticated: !!user,
        isLoading,
        role,
        setRole,
        userName: roleNames[role] || 'User',
        userEmail: user?.email || 'ashish.4u89@gmail.com',
        userPhone: '+91 98765 43210',
        signInWithGoogle,
        signInAsGuest,
        signOut,
        canViewCosts,
        canAdjustInventory,
        canAccessPOS,
        canViewReports,
        canManageProcurement,
        canManageDispatch,
        canManageReturns,
        posPasscodeVerified,
        verifyPOSPasscode,
        logoutPOS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
