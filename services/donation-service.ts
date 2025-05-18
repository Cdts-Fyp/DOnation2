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
  increment,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Donation } from '@/types';

// Collection reference
const donationsCollection = collection(db, 'donations');


// Helper to convert Firestore data to Donation object
const convertToDonation = (doc: any): Donation => {
  const data = doc.data();
  return {
    id: doc.id,
    programId: data.programId,
    donorId: data.donorId,
    donorName: data.donorName,
    donorAvatar: data.donorAvatar || null,
    amount: data.amount,
    date: data.date,
    status: data.status,
    paymentMethod: data.paymentMethod,
    isAnonymous: data.isAnonymous,
    note: data.note || '',
    createdAt: data.createdAt?.toDate() || new Date()
  };
};

// Enhanced helper that fetches donor avatar from user collection
const convertToDonationWithUserData = async (docSnapshot: any): Promise<Donation> => {
  const donation = convertToDonation(docSnapshot);
  
  // Only fetch user data if the donation is not anonymous and has a donorId
  if (!donation.isAnonymous && donation.donorId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', donation.donorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData && typeof userData === 'object' && 'avatar' in userData) {
          const avatar = userData.avatar;
          donation.donorAvatar = (typeof avatar === 'string') ? avatar : null;
        }
      }
    } catch (error) {
      console.error('Error fetching donor data:', error);
    }
  }
  
  return donation;
};

// Get all donations
export const getAllDonations = async (): Promise<Donation[]> => {
  try {
    const donationsQuery = query(donationsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(donationsQuery);
    
    const donations = [];
    for (const docSnapshot of snapshot.docs) {
      const donation = await convertToDonationWithUserData(docSnapshot);
      donations.push(donation);
    }
    
    return donations;
  } catch (error) {
    console.error('Error getting donations:', error);
    throw error;
  }
};

// Get donations for a specific program
export const getDonationsByProgram = async (programId: string): Promise<Donation[]> => {
  try {
    const donationsQuery = query(
      donationsCollection,
      where('programId', '==', programId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(donationsQuery);
    
    const donations = [];
    for (const docSnapshot of snapshot.docs) {
      const donation = await convertToDonationWithUserData(docSnapshot);
      donations.push(donation);
    }
    
    return donations;
  } catch (error) {
    console.error('Error getting donations for program:', error);
    throw error;
  }
};

// Subscribe to real-time updates for donations by program
export const subscribeToRecentDonations = (
  programId: string, 
  callback: (donations: Donation[]) => void,
  maxDonations: number = 5
) => {
  const donationsQuery = query(
    donationsCollection,
    where('programId', '==', programId),
    orderBy('createdAt', 'desc'),
    limit(maxDonations)
  );
  
  // Create a real-time listener
  const unsubscribe = onSnapshot(donationsQuery, async (snapshot) => {
    try {
      const donations = [];
      
      for (const docSnapshot of snapshot.docs) {
        const donation = await convertToDonationWithUserData(docSnapshot);
        donations.push(donation);
      }
      
      callback(donations);
    } catch (error) {
      console.error('Error in real-time donations listener:', error);
    }
  }, (error) => {
    console.error('Error in donation subscription:', error);
  });
  
  // Return the unsubscribe function to allow later cleanup
  return unsubscribe;
};

// Get donations by donor
export const getDonationsByDonor = async (donorId: string): Promise<Donation[]> => {
  try {
    const donationsQuery = query(
      donationsCollection,
      where('donorId', '==', donorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(donationsQuery);
    
    const donations = [];
    for (const docSnapshot of snapshot.docs) {
      const donation = await convertToDonationWithUserData(docSnapshot);
      donations.push(donation);
    }
    
    return donations;
  } catch (error) {
    console.error('Error getting donations for donor:', error);
    throw error;
  }
};

// Get a single donation by ID
export const getDonationById = async (id: string): Promise<Donation | null> => {
  try {
    const donationDoc = doc(db, 'donations', id);
    const snapshot = await getDoc(donationDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return convertToDonation(snapshot);
  } catch (error) {
    console.error('Error getting donation:', error);
    throw error;
  }
};

// Create a new donation
export const createDonation = async (donationData: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> => {
  try {
    // Get current program data to update the raised amount
    const programDoc = doc(db, 'programs', donationData.programId);
    const programSnapshot = await getDoc(programDoc);
    
    if (!programSnapshot.exists()) {
      throw new Error(`Program with ID ${donationData.programId} does not exist`);
    }
    
    const programData = programSnapshot.data();
    const newRaisedAmount = (programData.raised || 0) + donationData.amount;
    
    // If not anonymous and has a donorId, try to get the user's avatar
    let donorAvatar = donationData.donorAvatar || null;
    if (!donationData.isAnonymous && donationData.donorId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', donationData.donorId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && typeof userData === 'object' && 'avatar' in userData) {
            const avatar = userData.avatar;
            donorAvatar = (typeof avatar === 'string') ? avatar : null;
          }
        }
      } catch (error) {
        console.error('Error fetching donor avatar:', error);
      }
    }
    
    // Create donation with server timestamp and avatar
    const donationToAdd = {
      ...donationData,
      donorAvatar,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(donationsCollection, donationToAdd);
    
    // Update program's raised amount
    await updateDoc(programDoc, {
      raised: newRaisedAmount,
      updatedAt: serverTimestamp()
    });
    
    const newDonationSnapshot = await getDoc(docRef);
    return convertToDonation(newDonationSnapshot);
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

// Update an existing donation
export const updateDonation = async (id: string, donationData: Partial<Donation>): Promise<Donation> => {
  try {
    const donationDoc = doc(db, 'donations', id);
    const donationSnapshot = await getDoc(donationDoc);
    
    if (!donationSnapshot.exists()) {
      throw new Error(`Donation with ID ${id} does not exist`);
    }
    
    const originalDonation = convertToDonation(donationSnapshot);
    
    // If the amount is changed, update the program's raised amount
    if (donationData.amount !== undefined && donationData.amount !== originalDonation.amount) {
      const amountDifference = donationData.amount - originalDonation.amount;
      
      // Update program raised amount
      const programDoc = doc(db, 'programs', originalDonation.programId);
      const programSnapshot = await getDoc(programDoc);
      
      if (programSnapshot.exists()) {
        const programData = programSnapshot.data();
        const newRaisedAmount = (programData.raised || 0) + amountDifference;
        
        await updateDoc(programDoc, {
          raised: newRaisedAmount,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Remove fields that should not be updated directly
    const { id: _, createdAt, ...updateData } = donationData as any;
    
    await updateDoc(donationDoc, updateData);
    
    // Fetch the updated donation
    const updatedDonationSnapshot = await getDoc(donationDoc);
    return convertToDonation(updatedDonationSnapshot);
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
};

// Delete a donation
export const deleteDonation = async (id: string): Promise<void> => {
  try {
    const donationDoc = doc(db, 'donations', id);
    const donationSnapshot = await getDoc(donationDoc);
    
    if (!donationSnapshot.exists()) {
      throw new Error(`Donation with ID ${id} does not exist`);
    }
    
    const donation = convertToDonation(donationSnapshot);
    
    // Update program raised amount
    const programDoc = doc(db, 'programs', donation.programId);
    const programSnapshot = await getDoc(programDoc);
    
    if (programSnapshot.exists()) {
      const programData = programSnapshot.data();
      const newRaisedAmount = Math.max(0, (programData.raised || 0) - donation.amount);
      
      await updateDoc(programDoc, {
        raised: newRaisedAmount,
        updatedAt: serverTimestamp()
      });
    }
    
    await deleteDoc(donationDoc);
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
}; 