// Define types for our application

// Program type
export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  manager: string;
  startDate: string;
  endDate: string;
  target: number;
  raised: number;
  status: "active" | "draft" | "completed";
  volunteers: number;
  isFeatured: boolean;
  imageUrl?: string;
  tags?: string[];
  shortDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Program creation input type (without id and timestamps)
export type ProgramInput = Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'raised'>;

// Donation type
export interface Donation {
  id: string;
  programId: string;
  donorId: string;
  donorName: string;
  donorAvatar?: string | null;
  amount: number;
  date: string;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  isAnonymous: boolean;
  note?: string;
  createdAt: Date;
}

// Volunteer type
export interface Volunteer {
  id: string;
  programId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  joinedDate: string;
  status: "active" | "inactive";
}

// User roles
export type UserRole = "admin" | "donor" | "volunteer";

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
} 