import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Program, ProgramInput } from '@/types';

// Collection reference
const programsCollection = collection(db, 'programs');

// Helper to convert Firestore data to Program object
const convertToProgram = (doc: any): Program => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    category: data.category,
    location: data.location,
    manager: data.manager,
    startDate: data.startDate,
    endDate: data.endDate,
    target: data.target,
    raised: data.raised || 0,
    status: data.status,
    volunteers: data.volunteers || 0,
    isFeatured: data.isFeatured || false,
    imageUrl: data.imageUrl || '',
    tags: data.tags || [],
    shortDescription: data.shortDescription || '',
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
};

// Get all programs
export const getAllPrograms = async (): Promise<Program[]> => {
  try {
    const programsQuery = query(programsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(programsQuery);
    
    return snapshot.docs.map(convertToProgram);
  } catch (error) {
    console.error('Error getting programs:', error);
    throw error;
  }
};

// Get programs by status
export const getProgramsByStatus = async (status: Program['status']): Promise<Program[]> => {
  try {
    const programsQuery = query(
      programsCollection,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(programsQuery);
    
    return snapshot.docs.map(convertToProgram);
  } catch (error) {
    console.error(`Error getting ${status} programs:`, error);
    throw error;
  }
};

// Get a single program by ID
export const getProgramById = async (id: string): Promise<Program | null> => {
  try {
    const programDoc = doc(db, 'programs', id);
    const snapshot = await getDoc(programDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return convertToProgram(snapshot);
  } catch (error) {
    console.error('Error getting program:', error);
    throw error;
  }
};

// Create a new program
export const createProgram = async (programData: ProgramInput): Promise<Program> => {
  try {
    const programToAdd = {
      ...programData,
      raised: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(programsCollection, programToAdd);
    const newProgramSnapshot = await getDoc(docRef);
    
    return convertToProgram(newProgramSnapshot);
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

// Update an existing program
export const updateProgram = async (id: string, programData: Partial<Program>): Promise<Program> => {
  try {
    const programDoc = doc(db, 'programs', id);
    
    // Remove fields that should not be updated directly
    const { id: _, createdAt, ...updateData } = programData as any;
    
    // Add update timestamp
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(programDoc, updateData);
    
    // Fetch the updated program
    const updatedProgramSnapshot = await getDoc(programDoc);
    return convertToProgram(updatedProgramSnapshot);
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

// Delete a program
export const deleteProgram = async (id: string): Promise<void> => {
  try {
    const programDoc = doc(db, 'programs', id);
    await deleteDoc(programDoc);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

// Update program fundraising amount
export const updateProgramFundraisingAmount = async (id: string, newAmount: number): Promise<void> => {
  try {
    const programDoc = doc(db, 'programs', id);
    await updateDoc(programDoc, { 
      raised: newAmount,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating program fundraising amount:', error);
    throw error;
  }
};

// Update program volunteer count
export const updateProgramVolunteerCount = async (id: string, count: number): Promise<void> => {
  try {
    const programDoc = doc(db, 'programs', id);
    await updateDoc(programDoc, { 
      volunteers: count,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating program volunteer count:', error);
    throw error;
  }
};

// Get featured programs
export const getFeaturedPrograms = async (): Promise<Program[]> => {
  try {
    const programsQuery = query(
      programsCollection,
      where('isFeatured', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(programsQuery);
    
    return snapshot.docs.map(convertToProgram);
  } catch (error) {
    console.error('Error getting featured programs:', error);
    throw error;
  }
}; 