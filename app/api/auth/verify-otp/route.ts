import { NextResponse } from "next/server";
import { verifyOTP } from "@/services/otp";
import { auth } from "@/lib/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Check again if the email is already registered (double check)
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.log(
          `Email ${email} already exists, sign-in methods:`,
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
    } catch (firebaseError) {
      console.error("Firebase error checking email:", firebaseError);
      // Continue with verification even if Firebase check fails
    }

    // Verify OTP - Updated to await the now-async verifyOTP function
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired verification code. Please request a new code.",
          errorCode: "invalid-otp",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
