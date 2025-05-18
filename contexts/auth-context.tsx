"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "admin" | "donor" | "volunteer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: Date;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNewUser?: boolean }>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    isAdmin?: boolean
  ) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  completeOnboarding: (onboardingData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (oobCode: string, newPassword: string) => Promise<void>;
  verifyResetCode: (oobCode: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Firebase user to our User type
  const formatUser = async (
    firebaseUser: FirebaseUser
  ): Promise<User | null> => {
    if (!firebaseUser) return null;

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    const userData = userDoc.data();

    return {
      id: firebaseUser.uid,
      name: userData?.name || firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      role: userData?.role || "donor",
      avatar: userData?.avatar || firebaseUser.photoURL || "",
      createdAt: userData?.createdAt?.toDate() || new Date(),
      onboardingCompleted: userData?.onboardingCompleted || false,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          const formattedUser = await formatUser(firebaseUser);
          setUser(formattedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const formattedUser = await formatUser(userCredential.user);
      setUser(formattedUser);
    } catch (error: any) {
      // Only log unexpected errors, not common auth errors
      if (!error.code || !error.code.startsWith("auth/")) {
        console.error("Login failed:", error);
      }

      // Map Firebase error codes to more specific error types
      const errorCode = error.code || "";

      // Create a custom error with the Firebase code and a more friendly message
      const customError = new Error(getAuthErrorMessage(errorCode));
      // Preserve the original error code
      (customError as any).code = errorCode;
      // Mark it as a handled error to distinguish from unexpected errors
      (customError as any).handled = true;

      throw customError;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email. Please check your email or create a new account.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid login credentials. Please check your email and password.";
      case "auth/invalid-email":
        return "Invalid email format. Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Too many unsuccessful login attempts. Please try again later or reset your password.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/operation-not-allowed":
        return "This login method is not enabled. Please contact support.";
      case "auth/requires-recent-login":
        return "This operation requires a more recent login. Please sign in again.";
      default:
        return "An error occurred during login. Please try again.";
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Set custom parameters for the Google provider
      provider.setCustomParameters({
        prompt: "select_account", // Force account selection even if user is already signed in
      });

      const userCredential = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      let isNewUser = false;

      // If not, create a new user record
      if (!userDoc.exists()) {
        isNewUser = true;
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: userCredential.user.displayName || "User",
          email: userCredential.user.email,
          role: "donor", // Default role
          avatar:
            userCredential.user.photoURL ||
            `https://ui-avatars.com/api/?name=${userCredential.user.displayName?.replace(" ", "+")}`,
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
        });
      }

      const formattedUser = await formatUser(userCredential.user);
      setUser(formattedUser);

      return { isNewUser };
    } catch (error: any) {
      console.error("Google login failed:", error);
      // Reset loading state even when popup is closed by user
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        setIsLoading(false);
      }
      throw error;
    } finally {
      // This will handle any other error cases
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    isAdmin = false
  ) => {
    setIsLoading(true);
    try {
      // First make a comprehensive check if email already exists
      try {
        // Use a dedicated API endpoint for checking email existence
        const checkResponse = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const checkData = await checkResponse.json();

        if (!checkData.success) {
          throw new Error(
            checkData.message ||
              "Email is already registered. Please login instead."
          );
        }

        // Also verify with Firebase directly
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          throw new Error("Email is already registered. Please login instead.");
        }
      } catch (error: any) {
        // If the error is already our custom message, throw it
        if (error.message && error.message.includes("already registered")) {
          throw error;
        }
        // Only continue if the error isn't related to email existence
        if (error.code === "auth/email-already-in-use") {
          throw new Error("Email is already registered. Please login instead.");
        }
        // Otherwise, continue with registration attempt
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Check if admin emails exist
      let finalRole = role;
      if (isAdmin) {
        finalRole = "admin";
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: finalRole,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(" ", "+")}`,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
      });

      const formattedUser = await formatUser(userCredential.user);
      setUser(formattedUser);
    } catch (error: any) {
      console.error("Registration failed:", error);
      // Convert Firebase error to more user-friendly message
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email is already registered. Please login instead.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No authenticated user");

    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData: any) => {
    if (!user) throw new Error("No authenticated user");

    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          ...onboardingData,
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setUser((prev) =>
        prev ? { ...prev, ...onboardingData, onboardingCompleted: true } : null
      );
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset email failed:", error);
      throw error;
    }
  };

  const verifyResetCode = async (oobCode: string) => {
    try {
      return await verifyPasswordResetCode(auth, oobCode);
    } catch (error) {
      console.error("Verify reset code failed:", error);
      throw error;
    }
  };

  const resetPassword = async (oobCode: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        register,
        updateUserProfile,
        completeOnboarding,
        forgotPassword,
        resetPassword,
        verifyResetCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
