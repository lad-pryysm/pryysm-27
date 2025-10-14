
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase';

export interface User {
    name: string;
    email: string;
    role: 'admin' | 'master';
    companyName?: string;
    numPrinters?: string;
    country?: string;
    industry?: string;
    avatar?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    signupWithEmail: (signupData: Omit<User, 'role'> & {password: string}) => Promise<boolean>;
    loginWithEmail: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleUser = useCallback((rawUser: FirebaseUser | User | null, additionalData?: Partial<User>): User | null => {
        if (rawUser && 'email' in rawUser && rawUser.email) {
            const isFirebaseUser = 'uid' in rawUser;
            
            if (rawUser.email === 'demo@prysm.com') {
                localStorage.setItem('isDemoUser', 'true');
                const demoUser: User = { name: 'Demo User', email: 'demo@prysm.com', role: 'admin', ...additionalData };
                localStorage.setItem('user', JSON.stringify(demoUser));
                setUser(demoUser);
                return demoUser;
            }

            localStorage.removeItem('isDemoUser');

            if (rawUser.email === 'LAD@PRYYSM' || rawUser.email === 'LAD@admin.com') {
                const masterUser: User = {
                    name: 'LAD',
                    email: rawUser.email,
                    role: 'master',
                    avatar: isFirebaseUser ? (rawUser as FirebaseUser).photoURL ?? undefined : (rawUser as User)?.avatar,
                    ...additionalData
                };
                 localStorage.setItem('user', JSON.stringify(masterUser));
                 setUser(masterUser);
                 return masterUser;
            }

            const userData: User = {
                name: (isFirebaseUser ? (rawUser as FirebaseUser).displayName : (rawUser as User).name) || 'User',
                email: rawUser.email!,
                role: 'admin',
                avatar: (isFirebaseUser ? (rawUser as FirebaseUser).photoURL : (rawUser as User).avatar) || undefined,
                ...additionalData
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } else {
            localStorage.removeItem('isDemoUser');
            localStorage.removeItem('user');
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        const { auth } = getFirebaseClient();
        if (!auth) {
            // Firebase client not initialized on server — skip subscribing.
            setIsLoading(false);
            return;
        }
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
            if (fbUser) {
                setFirebaseUser(fbUser);
                const storedUser = localStorage.getItem('user');
                let appUser: User | null = null;
                if (storedUser) {
                    try {
                        const parsedUser: User = JSON.parse(storedUser);
                        if (parsedUser.email === fbUser.email) {
                           appUser = handleUser({ ...parsedUser, name: fbUser.displayName || parsedUser.name, avatar: fbUser.photoURL || parsedUser.avatar });
                        }
                    } catch {
                       // Corrupted data, fall back to fbUser
                    }
                }
                if (!appUser) {
                    appUser = handleUser(fbUser);
                }
            } else {
                setUser(null);
                setFirebaseUser(null);
                localStorage.removeItem('user');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [handleUser]);
    
    const navigateAfterLogin = (loggedInUser: User | null) => {
         if (loggedInUser) {
            if (loggedInUser.role === 'master') {
                router.push('/master-admin');
            } else {
                router.push('/dashboard');
            }
            return true;
        }
        return false;
    }

    const signupWithEmail = async (signupData: Omit<User, 'role'> & {password: string}): Promise<boolean> => {
        const { auth } = getFirebaseClient();
        if (!auth) throw new Error('Firebase auth is not available in this environment');
        const { email, password, name, ...rest } = signupData;
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            const appUser = handleUser(userCredential.user, {name, ...rest});
            localStorage.setItem('new_signup', 'true');
            return navigateAfterLogin(appUser);
        } catch (error) {
            console.error("Firebase Signup Error:", error);
            return false;
        }
    };
    
    const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
        const { auth } = getFirebaseClient();
        if (!auth) throw new Error('Firebase auth is not available in this environment');
        
        // Handle mock users first
        if (email === 'demo@prysm.com' && pass === 'demo123') {
            const userToLogin: User = { name: 'Demo User', email, role: 'admin' };
            return navigateAfterLogin(handleUser(userToLogin));
        }
        if ((email === 'LAD@PRYYSM' && pass === 'Lad@1234') || (email === 'LAD@admin.com' && pass === 'Lad123')) {
            const userToLogin: User = { name: 'LAD', email, role: 'master' };
            return navigateAfterLogin(handleUser(userToLogin));
        }
         if (email === 'admin@prysm.com' && pass === 'Lad123') {
            const userToLogin: User = { name: 'Admin User', email, role: 'admin' };
            return navigateAfterLogin(handleUser(userToLogin));
        }

        // Firebase email/password login
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const loggedInUser = handleUser(userCredential.user);
            return navigateAfterLogin(loggedInUser);
        } catch (error) {
            console.error("Firebase Email/Password Sign In Error: ", error);
            return false;
        }
    };

    const logout = async () => {
        const { auth } = getFirebaseClient();
        if (!auth) {
            setUser(null);
            setFirebaseUser(null);
            router.push('/login');
            return;
        }
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error", error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('isDemoUser');
            setUser(null);
            setFirebaseUser(null);
            router.push('/login');
        }
    };

    const updateUserProfile = (updates: Partial<User>) => {
        if(user) {
            const updatedUser = {...user, ...updates};
            handleUser(updatedUser);
        }
    };

    const value: AuthContextType = {
        isAuthenticated: !!user,
        user,
        firebaseUser,
        isLoading,
        signupWithEmail,
        loginWithEmail,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
