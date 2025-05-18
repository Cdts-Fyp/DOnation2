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
  runTransaction 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Volunteer } from '@/types';
import { updateProgramVolunteerCount } from './program-service';

// Collection reference
const volunteersCollection = collection(db, 'volunteers');

// Helper to convert Firestore data to Volunteer object
const convertToVolunteer = (doc: any): Volunteer => {
  const data = doc.data();
  return {
    id: doc.id,
    programId: data.programId,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    role: data.role,
    joinedDate: data.joinedDate,
    status: data.status
  };
};

// Get all volunteers
export const getAllVolunteers = async (): Promise<Volunteer[]> => {
  try {
    const volunteersQuery = query(volunteersCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(volunteersQuery);
    
    return snapshot.docs.map(convertToVolunteer);
  } catch (error) {
    console.error('Error getting volunteers:', error);
    throw error;
  }
};

// Get volunteers for a specific program
export const getVolunteersByProgram = async (programId: string): Promise<Volunteer[]> => {
  try {
    const volunteersQuery = query(
      volunteersCollection,
      where('programId', '==', programId),
      orderBy('joinedDate', 'desc')
    );
    const snapshot = await getDocs(volunteersQuery);
    
    return snapshot.docs.map(convertToVolunteer);
  } catch (error) {
    console.error('Error getting volunteers for program:', error);
    throw error;
  }
};

// Get active volunteers for a specific program
export const getActiveVolunteersByProgram = async (programId: string): Promise<Volunteer[]> => {
  try {
    const volunteersQuery = query(
      volunteersCollection,
      where('programId', '==', programId),
      where('status', '==', 'active'),
      orderBy('joinedDate', 'desc')
    );
    const snapshot = await getDocs(volunteersQuery);
    
    return snapshot.docs.map(convertToVolunteer);
  } catch (error) {
    console.error('Error getting active volunteers for program:', error);
    throw error;
  }
};

// Get a single volunteer by ID
export const getVolunteerById = async (id: string): Promise<Volunteer | null> => {
  try {
    const volunteerDoc = doc(db, 'volunteers', id);
    const snapshot = await getDoc(volunteerDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return convertToVolunteer(snapshot);
  } catch (error) {
    console.error('Error getting volunteer:', error);
    throw error;
  }
};

// Create a new volunteer
export const createVolunteer = async (volunteerData: Omit<Volunteer, 'id'>): Promise<Volunteer> => {
  try {
    // Add volunteer
    const docRef = await addDoc(volunteersCollection, volunteerData);
    const newVolunteerSnapshot = await getDoc(docRef);
    
    // Update program volunteer count
    await updateProgramVolunteerCountOnChange(volunteerData.programId);
    
    return convertToVolunteer(newVolunteerSnapshot);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    throw error;
  }
};

// Update an existing volunteer
export const updateVolunteer = async (id: string, volunteerData: Partial<Volunteer>): Promise<Volunteer> => {
  try {
    const volunteerDoc = doc(db, 'volunteers', id);
    const volunteerSnapshot = await getDoc(volunteerDoc);
    
    if (!volunteerSnapshot.exists()) {
      throw new Error(`Volunteer with ID ${id} does not exist`);
    }
    
    const originalVolunteer = convertToVolunteer(volunteerSnapshot);
    const oldProgramId = originalVolunteer.programId;
    
    // Update volunteer
    const { id: _, ...updateData } = volunteerData as any;
    await updateDoc(volunteerDoc, updateData);
    
    // If program changed or status changed, update both programs' volunteer counts
    if (
      (volunteerData.programId && volunteerData.programId !== oldProgramId) ||
      (volunteerData.status && volunteerData.status !== originalVolunteer.status)
    ) {
      // Update old program count
      await updateProgramVolunteerCountOnChange(oldProgramId);
      
      // Update new program count if program changed
      if (volunteerData.programId && volunteerData.programId !== oldProgramId) {
        await updateProgramVolunteerCountOnChange(volunteerData.programId);
      }
    }
    
    // Fetch the updated volunteer
    const updatedVolunteerSnapshot = await getDoc(volunteerDoc);
    return convertToVolunteer(updatedVolunteerSnapshot);
  } catch (error) {
    console.error('Error updating volunteer:', error);
    throw error;
  }
};

// Delete a volunteer
export const deleteVolunteer = async (id: string): Promise<void> => {
  try {
    const volunteerDoc = doc(db, 'volunteers', id);
    const volunteerSnapshot = await getDoc(volunteerDoc);
    
    if (!volunteerSnapshot.exists()) {
      throw new Error(`Volunteer with ID ${id} does not exist`);
    }
    
    const volunteer = convertToVolunteer(volunteerSnapshot);
    
    // Delete volunteer
    await deleteDoc(volunteerDoc);
    
    // Update program volunteer count
    await updateProgramVolunteerCountOnChange(volunteer.programId);
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    throw error;
  }
};

// Helper function to update program volunteer count after changes
const updateProgramVolunteerCountOnChange = async (programId: string): Promise<void> => {
  try {
    // Get active volunteers count for this program
    const activeVolunteersQuery = query(
      volunteersCollection,
      where('programId', '==', programId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(activeVolunteersQuery);
    const activeVolunteersCount = snapshot.docs.length;
    
    // Update program's volunteer count
    await updateProgramVolunteerCount(programId, activeVolunteersCount);
  } catch (error) {
    console.error('Error updating program volunteer count:', error);
    throw error;
  }
}; 