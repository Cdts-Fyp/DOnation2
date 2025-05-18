import nodemailer from "nodemailer";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Gmail SMTP configuration
// NOTE: For Gmail, you need to:
// 1. Enable 2-step verification on your Google account
// 2. Generate an App Password: Google Account > Security > App passwords
// 3. Use that App Password here instead of your regular password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "sejal.bscsf21@iba-suk.edu.pk", // replace with your Gmail address
    pass: "ypji nkvp ckal vbxd", // replace with your app password
  },
});

// OTP collection reference
const otpCollection = collection(db, "otps");

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP with expiration (15 minutes)
const saveOTP = async (email: string, otp: string): Promise<void> => {
  try {
    // First, remove any existing OTPs for this email
    const existingOTPQuery = query(otpCollection, where("email", "==", email));
    const existingOTPs = await getDocs(existingOTPQuery);

    // Delete any existing OTPs
    const deletePromises = existingOTPs.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Calculate expiration time (15 minutes from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    // Add new OTP to Firestore
    await addDoc(otpCollection, {
      email,
      otp,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    // Log OTP for debugging purposes
    console.log(`OTP for ${email}: ${otp} (expires in 15 minutes)`);
  } catch (error) {
    console.error("Error saving OTP to Firestore:", error);
    throw error;
  }
};

// Verify OTP with more robust logic
const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log(`Attempting to verify OTP: ${otp} for email: ${email}`);

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOTP = otp.trim();

    // Query Firestore for matching OTP
    const otpQuery = query(
      otpCollection,
      where("email", "==", normalizedEmail),
      where("otp", "==", normalizedOTP)
    );

    const otpSnapshot = await getDocs(otpQuery);

    if (otpSnapshot.empty) {
      console.log(`No OTP records found for ${email}`);
      return false;
    }

    console.log(`Found ${otpSnapshot.size} OTP records for ${email}`);

    // Check if any OTP is valid (not expired)
    const now = new Date();
    let validOTPFound = false;
    let recentlyExpiredFound = false;

    // We'll delete all OTPs for this email, whether valid or not
    const deletePromises = [];

    for (const doc of otpSnapshot.docs) {
      const otpData = doc.data();
      const expiresAt = otpData.expiresAt?.toDate() || new Date(0);

      console.log(
        `OTP record: expires in ${(expiresAt.getTime() - now.getTime()) / 1000} seconds`
      );

      // Check if OTP is valid (not expired)
      if (expiresAt > now) {
        validOTPFound = true;
      }
      // Check if OTP expired recently (within last 5 minutes)
      else if (expiresAt > new Date(now.getTime() - 5 * 60 * 1000)) {
        recentlyExpiredFound = true;
      }

      // Queue this document for deletion
      deletePromises.push(deleteDoc(doc.ref));
    }

    // Delete all OTPs for this email regardless of outcome
    await Promise.all(deletePromises);

    if (validOTPFound) {
      console.log(`Valid OTP found for ${email}`);
      return true;
    }

    if (recentlyExpiredFound) {
      console.log(
        `Recently expired OTP found for ${email}, accepting it anyway`
      );
      return true;
    }

    console.log(`No valid or recently expired OTP found for ${email}`);
    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
};

// Send OTP via email using Nodemailer
const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<{ success: boolean }> => {
  try {
    const mailOptions = {
      from: '"Do App" <your-email@gmail.com>', // replace with your Gmail address
      to: email,
      subject: "Your Verification Code for Do",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">Your Verification Code</h2>
          <p>Please use the following code to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 16px;">This code will expire in 15 minutes.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false };
  }
};

// Create and send OTP
const createAndSendOTP = async (
  email: string
): Promise<{ success: boolean }> => {
  try {
    const otp = generateOTP();

    // IMPORTANT: Save the OTP *before* sending the email to avoid race conditions
    await saveOTP(email, otp);

    // Add a small delay to ensure the OTP is saved in Firestore before verification attempts
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await sendOTPEmail(email, otp);

    // If email sending fails, we should remove the OTP
    if (!result.success) {
      // Try to remove the OTP from Firestore
      try {
        const otpQuery = query(
          otpCollection,
          where("email", "==", email),
          where("otp", "==", otp)
        );
        const otpSnapshot = await getDocs(otpQuery);

        const deletePromises = otpSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error("Error removing OTP after failed email:", deleteError);
      }
    }

    return result;
  } catch (error) {
    console.error("Error in createAndSendOTP:", error);
    return { success: false };
  }
};

export { createAndSendOTP, verifyOTP };
