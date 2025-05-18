import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Donation } from '@/types';
import { getAllDonations, getDonationsByProgram, getDonationsByDonor } from './donation-service';
import { getAllPrograms } from './program-service';
import { getAllVolunteers } from './volunteer-service';

// Helper function to format date
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Helper to calculate date range based on selection
export const getDateRange = (dateRangeStr: string): { startDate: Date, endDate: Date } => {
  const now = new Date();
  const endDate = new Date();
  let startDate = new Date();
  
  switch (dateRangeStr) {
    case 'last7days':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last30days':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'lastQuarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
      break;
    case 'lastYear':
      startDate = new Date(now.getFullYear() - 1, 0, 1); // January 1st of last year
      endDate.setFullYear(now.getFullYear() - 1, 11, 31); // December 31st of last year
      break;
    default: // Default to last 30 days
      startDate.setDate(now.getDate() - 30);
  }
  
  // Reset hours to get full days
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// Helper function to generate workbook
const generateWorkbook = (data: any[], headers: string[]): XLSX.WorkBook => {
  // Map the data to an array of arrays (each inner array represents a row)
  const rows = data.map(item => headers.map(header => item[header] || ''));
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([
    headers, // First row is the header row
    ...rows
  ]);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  return workbook;
};

// Generate Excel file and trigger download
const downloadExcelFile = (workbook: XLSX.WorkBook, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create download progress popup
      const popup = document.createElement('div');
      popup.style.position = 'fixed';
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.background = 'white';
      popup.style.padding = '20px';
      popup.style.borderRadius = '8px';
      popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      popup.style.zIndex = '9999';
      popup.style.minWidth = '300px';
      popup.style.textAlign = 'center';
      
      // Add spinning icon and text
      popup.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <div style="border: 3px solid #f3f3f3; border-top: 3px solid #0ea5e9; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-right: 12px;"></div>
          <div style="font-weight: 500; color: #111827;">Preparing your download...</div>
        </div>
        <div style="color: #6b7280; font-size: 14px;">Please wait while we generate your file</div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      
      document.body.appendChild(popup);
      
      // Convert workbook to binary string after showing the popup
      setTimeout(() => {
        try {
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          
          // Create Blob from buffer
          const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
          
          // Use FileSaver to save the file
          saveAs(data, fileName);
          
          // Show success message before removing popup
          popup.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <div style="background: #10b981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">✓</div>
              <div style="font-weight: 500; color: #111827;">Download complete!</div>
            </div>
            <div style="color: #6b7280; font-size: 14px;">${fileName} has been downloaded</div>
          `;
          
          // Remove popup after a delay
          setTimeout(() => {
            document.body.removeChild(popup);
            resolve();
          }, 2000);
        } catch (error) {
          document.body.removeChild(popup);
          reject(error);
        }
      }, 1000); // Small delay to ensure the popup is visible
    } catch (error) {
      reject(error);
    }
  });
};

// Generate donation summary report
export const generateDonationSummaryReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allDonations = await getAllDonations();
    
    // Filter donations by date range
    const filteredDonations = allDonations.filter(donation => {
      const donationDate = new Date(donation.date);
      return donationDate >= startDate && donationDate <= endDate;
    });
    
    // Transform data for report
    const reportData = filteredDonations.map(donation => ({
      'Donation ID': donation.id,
      'Date': formatDate(donation.date),
      'Donor': donation.isAnonymous ? 'Anonymous' : donation.donorName,
      'Program ID': donation.programId,
      'Amount (Rs.)': donation.amount.toFixed(2),
      'Payment Method': donation.paymentMethod,
      'Status': donation.status,
      'Note': donation.note
    }));
    
    // Define headers for the Excel file
    const headers = ['Donation ID', 'Date', 'Donor', 'Program ID', 'Amount (Rs.)', 'Payment Method', 'Status', 'Note'];
    
    // Generate workbook and download
    const workbook = generateWorkbook(reportData, headers);
    await downloadExcelFile(workbook, `donation-summary-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating donation summary report:', error);
    throw error;
  }
};

// Generate donor activity report
export const generateDonorActivityReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allDonations = await getAllDonations();
    
    // Filter donations by date range
    const filteredDonations = allDonations.filter(donation => {
      const donationDate = new Date(donation.date);
      return donationDate >= startDate && donationDate <= endDate;
    });
    
    // Group donations by donor
    const donorMap = new Map<string, {
      donations: number;
      totalAmount: number;
      firstDonation: Date;
      lastDonation: Date;
      donorName: string;
    }>();
    
    filteredDonations.forEach(donation => {
      if (donation.isAnonymous) return;
      
      const donorId = donation.donorId;
      const donationDate = new Date(donation.date);
      
      if (!donorMap.has(donorId)) {
        donorMap.set(donorId, {
          donations: 1,
          totalAmount: donation.amount,
          firstDonation: donationDate,
          lastDonation: donationDate,
          donorName: donation.donorName
        });
      } else {
        const donor = donorMap.get(donorId)!;
        donor.donations += 1;
        donor.totalAmount += donation.amount;
        
        if (donationDate < donor.firstDonation) {
          donor.firstDonation = donationDate;
        }
        
        if (donationDate > donor.lastDonation) {
          donor.lastDonation = donationDate;
        }
      }
    });
    
    // Transform data for report
    const reportData = Array.from(donorMap.entries()).map(([donorId, data]) => ({
      'Donor ID': donorId,
      'Donor Name': data.donorName,
      'Number of Donations': data.donations,
      'Total Amount (Rs.)': data.totalAmount.toFixed(2),
      'Average Donation (Rs.)': (data.totalAmount / data.donations).toFixed(2),
      'First Donation': formatDate(data.firstDonation),
      'Last Donation': formatDate(data.lastDonation),
      'Days Since Last Donation': Math.floor((new Date().getTime() - data.lastDonation.getTime()) / (1000 * 60 * 60 * 24))
    }));
    
    // Define headers for the Excel file
    const headers = [
      'Donor ID', 'Donor Name', 'Number of Donations', 'Total Amount (Rs.)', 
      'Average Donation (Rs.)', 'First Donation', 'Last Donation', 'Days Since Last Donation'
    ];
    
    // Generate workbook and download
    const workbook = generateWorkbook(reportData, headers);
    await downloadExcelFile(workbook, `donor-activity-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating donor activity report:', error);
    throw error;
  }
};

// Generate program performance report
export const generateProgramPerformanceReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allPrograms = await getAllPrograms();
    const allDonations = await getAllDonations();
    
    // Filter donations by date range
    const filteredDonations = allDonations.filter(donation => {
      const donationDate = new Date(donation.date);
      return donationDate >= startDate && donationDate <= endDate;
    });
    
    // Create a map of program performance
    const programMap = new Map<string, {
      programName: string;
      target: number;
      raised: number;
      donors: Set<string>;
      donations: number;
      category: string;
      startDate: string;
      endDate: string;
    }>();
    
    // Initialize the map with program data
    allPrograms.forEach(program => {
      programMap.set(program.id, {
        programName: program.title,
        target: program.target,
        raised: program.raised || 0,
        donors: new Set(),
        donations: 0,
        category: program.category,
        startDate: formatDate(program.startDate),
        endDate: formatDate(program.endDate)
      });
    });
    
    // Update with donation data
    filteredDonations.forEach(donation => {
      const programData = programMap.get(donation.programId);
      if (programData) {
        programData.donations += 1;
        if (!donation.isAnonymous) {
          programData.donors.add(donation.donorId);
        }
      }
    });
    
    // Transform data for report
    const reportData = Array.from(programMap.values()).map(program => ({
      'Program Name': program.programName,
      'Category': program.category,
      'Target Amount (Rs.)': program.target.toFixed(2),
      'Raised Amount (Rs.)': program.raised.toFixed(2),
      'Completion %': ((program.raised / program.target) * 100).toFixed(1) + '%',
      'Unique Donors': program.donors.size,
      'Number of Donations': program.donations,
      'Start Date': program.startDate,
      'End Date': program.endDate
    }));
    
    // Define headers for the Excel file
    const headers = [
      'Program Name', 'Category', 'Target Amount (Rs.)', 'Raised Amount (Rs.)', 
      'Completion %', 'Unique Donors', 'Number of Donations', 'Start Date', 'End Date'
    ];
    
    // Generate workbook and download
    const workbook = generateWorkbook(reportData, headers);
    await downloadExcelFile(workbook, `program-performance-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating program performance report:', error);
    throw error;
  }
};

// Generate program expenses report
export const generateProgramExpensesReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allPrograms = await getAllPrograms();
    
    // Transform data for report (mock data for expenses)
    const reportData = allPrograms.map(program => {
      // Calculate a mock budget allocation based on target amount
      const administration = program.target * 0.15;
      const operations = program.target * 0.25;
      const services = program.target * 0.55;
      const marketing = program.target * 0.05;
      
      return {
        'Program Name': program.title,
        'Category': program.category,
        'Total Budget (Rs.)': program.target.toFixed(2),
        'Administration (Rs.)': administration.toFixed(2),
        'Operations (Rs.)': operations.toFixed(2),
        'Services (Rs.)': services.toFixed(2),
        'Marketing (Rs.)': marketing.toFixed(2),
        'Admin %': '15%',
        'Operations %': '25%',
        'Services %': '55%',
        'Marketing %': '5%'
      };
    });
    
    // Define headers for the Excel file
    const headers = [
      'Program Name', 'Category', 'Total Budget (Rs.)', 
      'Administration (Rs.)', 'Operations (Rs.)', 'Services (Rs.)', 'Marketing (Rs.)',
      'Admin %', 'Operations %', 'Services %', 'Marketing %'
    ];
    
    // Generate workbook and download
    const workbook = generateWorkbook(reportData, headers);
    await downloadExcelFile(workbook, `program-expenses-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating program expenses report:', error);
    throw error;
  }
};

// Generate volunteer activity report
export const generateVolunteerActivityReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allVolunteers = await getAllVolunteers();
    
    // Generate mock hours data for volunteers
    const reportData = allVolunteers.map(volunteer => {
      // Random hours between 5 and 50
      const hours = Math.floor(Math.random() * 45) + 5;
      // Random programs between 1 and 3
      const programs = Math.floor(Math.random() * 3) + 1;
      
      return {
        'Volunteer ID': volunteer.id,
        'Name': volunteer.name,
        'Email': volunteer.email,
        'Phone': volunteer.phone || 'N/A',
        'Hours Contributed': hours,
        'Programs Participating': programs,
        'Status': volunteer.status,
        'Joined Date': formatDate(volunteer.joinedDate)
      };
    });
    
    // Define headers for the Excel file
    const headers = [
      'Volunteer ID', 'Name', 'Email', 'Phone', 
      'Hours Contributed', 'Programs Participating', 'Status', 'Joined Date'
    ];
    
    // Generate workbook and download
    const workbook = generateWorkbook(reportData, headers);
    await downloadExcelFile(workbook, `volunteer-activity-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating volunteer activity report:', error);
    throw error;
  }
};

// Generate annual report (comprehensive report)
export const generateAnnualReport = async (dateRange: string): Promise<void> => {
  try {
    const { startDate, endDate } = getDateRange(dateRange);
    const allDonations = await getAllDonations();
    const allPrograms = await getAllPrograms();
    const allVolunteers = await getAllVolunteers();
    
    // Filter donations by date range
    const filteredDonations = allDonations.filter(donation => {
      const donationDate = new Date(donation.date);
      return donationDate >= startDate && donationDate <= endDate;
    });
    
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // 1. Donation Summary Sheet
    const donationData = filteredDonations.map(donation => ({
      'Donation ID': donation.id,
      'Date': formatDate(donation.date),
      'Donor': donation.isAnonymous ? 'Anonymous' : donation.donorName,
      'Program': donation.programId,
      'Amount (Rs.)': donation.amount.toFixed(2),
      'Payment Method': donation.paymentMethod,
      'Status': donation.status
    }));
    
    const donationHeaders = ['Donation ID', 'Date', 'Donor', 'Program', 'Amount (Rs.)', 'Payment Method', 'Status'];
    const donationSheet = XLSX.utils.aoa_to_sheet([
      donationHeaders,
      ...donationData.map(item => donationHeaders.map(header => {
        // Type assertion to access properties using string index
        return (item as Record<string, any>)[header] || '';
      }))
    ]);
    XLSX.utils.book_append_sheet(workbook, donationSheet, 'Donations');
    
    // 2. Program Performance Sheet
    const programData = allPrograms.map(program => ({
      'Program ID': program.id,
      'Program Name': program.title,
      'Category': program.category,
      'Target Amount (Rs.)': program.target.toFixed(2),
      'Raised Amount (Rs.)': (program.raised || 0).toFixed(2),
      'Completion %': ((program.raised || 0) / program.target * 100).toFixed(1) + '%',
      'Start Date': formatDate(program.startDate),
      'End Date': formatDate(program.endDate)
    }));
    
    const programHeaders = [
      'Program ID', 'Program Name', 'Category', 'Target Amount (Rs.)', 
      'Raised Amount (Rs.)', 'Completion %', 'Start Date', 'End Date'
    ];
    const programSheet = XLSX.utils.aoa_to_sheet([
      programHeaders,
      ...programData.map(item => programHeaders.map(header => {
        // Type assertion to access properties using string index
        return (item as Record<string, any>)[header] || '';
      }))
    ]);
    XLSX.utils.book_append_sheet(workbook, programSheet, 'Programs');
    
    // 3. Volunteer Summary Sheet
    const volunteerData = allVolunteers.map(volunteer => {
      // Random hours between 5 and 50
      const hours = Math.floor(Math.random() * 45) + 5;
      
      return {
        'Volunteer ID': volunteer.id,
        'Name': volunteer.name,
        'Email': volunteer.email,
        'Status': volunteer.status,
        'Hours Contributed': hours,
        'Joined Date': formatDate(volunteer.joinedDate)
      };
    });
    
    const volunteerHeaders = [
      'Volunteer ID', 'Name', 'Email', 'Status', 'Hours Contributed', 'Joined Date'
    ];
    const volunteerSheet = XLSX.utils.aoa_to_sheet([
      volunteerHeaders,
      ...volunteerData.map(item => volunteerHeaders.map(header => {
        // Type assertion to access properties using string index
        return (item as Record<string, any>)[header] || '';
      }))
    ]);
    XLSX.utils.book_append_sheet(workbook, volunteerSheet, 'Volunteers');
    
    // Download the workbook
    await downloadExcelFile(workbook, `annual-report-${formatDate(new Date())}.xlsx`);
    
  } catch (error) {
    console.error('Error generating annual report:', error);
    throw error;
  }
};

// Main function to generate any type of report
export const generateReport = async (
  reportType: string, 
  dateRange: string, 
  format: string
): Promise<void> => {
  // For formats other than Excel, we'll just use Excel for now
  // In a real app, you'd implement PDF and CSV generation here
  
  switch (reportType) {
    case 'donation-summary':
      await generateDonationSummaryReport(dateRange);
      break;
    case 'donor-activity':
      await generateDonorActivityReport(dateRange);
      break;
    case 'program-performance':
      await generateProgramPerformanceReport(dateRange);
      break;
    case 'program-expenses':
      await generateProgramExpensesReport(dateRange);
      break;
    case 'volunteer-activity':
      await generateVolunteerActivityReport(dateRange);
      break;
    case 'annual-report':
      await generateAnnualReport(dateRange);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}; 