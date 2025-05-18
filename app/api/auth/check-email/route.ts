import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // COMPREHENSIVE CHECK 1: Check in Firebase Auth if email exists
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.log(
          `Email ${email} already exists in Firebase Auth with methods:`,
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
      console.error("Firebase Auth error checking email:", firebaseError);

      // If the error explicitly indicates the email exists
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

    // COMPREHENSIVE CHECK 2: Check in Firestore if email exists
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Email ${email} already exists in Firestore database`);
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
      console.error("Firestore error checking email:", firestoreError);
      // Continue even if this check fails
    }

    // Email doesn't exist in Firebase
    console.log(`Email ${email} is available for registration`);
    return NextResponse.json({
      success: true,
      message: "Email is available for registration",
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
