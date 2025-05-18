import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // FIRST CHECK: Check in Firebase Auth if email exists
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.log(
          `Email ${email} already exists in Firebase Auth, methods:`,
          signInMethods
        );
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered. Please login instead.",
            errorCode: "email-already-exists",
          },
          { status: 400 }
        );
      }
    } catch (firebaseError: any) {
      console.error("Error checking email in Firebase Auth:", firebaseError);
      if (firebaseError.code === "auth/email-already-in-use") {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered. Please login instead.",
            errorCode: "email-already-exists",
          },
          { status: 400 }
        );
      }
    }

    // SECOND CHECK: Check in Firestore if email exists
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Email ${email} already exists in Firestore`);
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered. Please login instead.",
            errorCode: "email-already-exists",
          },
          { status: 400 }
        );
      }
    } catch (firestoreError) {
      console.error("Error checking email in Firestore:", firestoreError);
      // Continue with the registration even if this check fails
    }

    // Create user in Firebase Auth with try/catch specifically for email-already-in-use
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(" ", "+")}`,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
      });

      return NextResponse.json({
        success: true,
        message: "User registered successfully",
        uid: userCredential.user.uid,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.code === "auth/email-already-in-use") {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered. Please login instead.",
            errorCode: "email-already-exists",
          },
          { status: 400 }
        );
      }

      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user" },
      { status: 500 }
    );
  }
}
