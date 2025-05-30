import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
  en: {
    // Navbar & General
    home: 'Home',
    searchViolations: 'Search Violations',
    uploadTicket: 'Upload Ticket',
    seedData: 'Seed Data',
    login: 'Login',
    signUp: 'Sign Up',
    searchPlateNumber: 'Search Plate Number',
    uploadTicketToAppeal: 'Upload Ticket to Appeal',
    logout: "Log out",
    // Dashboard
    welcomeBack: 'Welcome back,',
    manageTrafficViolationsAndAppeals: 'Manage your traffic violations and appeals',
    outstandingFines: 'Outstanding Fines',
    totalViolations: 'Total Violations',
    underReview: 'Under Review',
    dismissed: 'Dismissed',
    trafficViolations: 'Traffic Violations',
    myVehicles: 'My Vehicles',
    violationMap: 'Violation Map',
    analytics: 'Analytics',
    vehicle: 'Vehicle',
    filterByVehicle: 'Filter by vehicle',
    status: 'Status',
    filterByStatus: 'Filter by status',
    noViolationsFound: 'No violations found',
    addAVehicleToStartTrackingViolations: 'Add a vehicle to start tracking violations.',
    viewMore: 'View more',
    manageYourRegisteredVehiclesAndTheirViolations: 'Manage your registered vehicles and their violations',
    noVehiclesToBeChecked: 'No vehicles to be checked',
    addVehicle: 'Add Vehicle',
    viewViolations: 'View Violations',
    viewYourViolationsOnTheMap: 'View your violations on the map',
    viewYourViolationStatisticsAndTrends: 'View your violation statistics and trends',
    heroDescription: "Your smart NCAP violation checker and traffic assistant. Check violations, upload tickets for AI analysis, and generate professional appeals. Fast, accurate, and easy to use.",
    // VehicleManagement
    'vehicleManagement.title': 'Vehicle Management',
    'vehicleManagement.myVehicles': 'My Vehicles',
    'vehicleManagement.manageRegisteredVehicles': 'Manage your registered vehicles',
    'vehicleManagement.addVehicle': 'Add Vehicle',
    'vehicleManagement.addNewVehicle': 'Add New Vehicle',
    'vehicleManagement.enterVehicleDetailsBelow': 'Enter your vehicle details below',
    'vehicleManagement.plateNumber': 'Plate Number',
    'vehicleManagement.type': 'Type',
    'vehicleManagement.selectVehicleType': 'Select vehicle type',
    'vehicleManagement.sedan': 'Sedan',
    'vehicleManagement.suv': 'SUV',
    'vehicleManagement.truck': 'Truck',
    'vehicleManagement.van': 'Van',
    'vehicleManagement.motorcycle': 'Motorcycle',
    'vehicleManagement.brand': 'Brand',
    'vehicleManagement.model': 'Model',
    'vehicleManagement.year': 'Year',
    'vehicleManagement.saveChanges': 'Save Changes',
    'vehicleManagement.editVehicle': 'Edit Vehicle',
    'vehicleManagement.updateVehicleDetails': 'Update your vehicle details',
    'vehicleManagement.noVehiclesFound': 'No Vehicles Found',
    'vehicleManagement.noVehiclesYet': "You haven't added any vehicles yet. Click the button above to add your first vehicle.",
    // PlateSearch
    searching: 'Searching',
    search: 'Search',
    violationHistory: 'Violation History',
    ticket: 'Ticket',
    // AIAnalysis
    aiViolationAnalysis: 'AI Violation Analysis',
    aiAnalysisInProgress: 'AI Analysis in Progress',
    aiAnalysisResults: 'AI Analysis Results',
    completedAnalysis: 'Completed analysis using Gemini Vision AI',
    validViolation: 'Valid Violation',
    possiblyUnfair: 'Possibly Unfair',
    uncertain: 'Uncertain',
    issuesFound: 'Issues Found',
    recommendations: 'Recommendations',
    extractedInformation: 'Extracted Information',
    qualityChecks: 'Quality Checks',
    plateNumberMatch: 'Plate Number Match',
    imageQuality: 'Image Quality',
    generateAppealLetter: 'Generate Appeal Letter',
    back: 'Back',
    adminDashboard: "Admin Dashboard",
    manageAppealsAndViolations: "Manage appeals and violations",
    backToAppeals: "Back to Appeals",
    appealDetails: "Appeal Details",
    reviewDetailsAndTakeAction: "Review all details and take action",
    ticketNumber: "Ticket Number",
    plateNumber: "Plate Number",
    location: "Location",
    dateSubmitted: "Date Submitted",
    userName: "User Name",
    violationType: "Violation Type",
    appealReason: "Appeal Reason",
    approve: "Approve",
    deny: "Deny",
    totalAppeals: "Total Appeals",
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
    filterAppeals: "Filter Appeals",
    searchByTicketNameOrPlate: "Search by ticket number, name, or plate...",
    allStatus: "All Status",
    appealsManagement: "Appeals Management",
    reviewAndProcessViolationAppeals: "Review and process violation appeals",
    // ...add more keys as needed
  },
  tl: {
    // Navbar & General
    home: 'Bahay',
    searchViolations: 'Hanapin ang Paglabag',
    uploadTicket: 'Mag-upload ng Tiket',
    seedData: 'Maglagay ng Data',
    login: 'Mag-login',
    signUp: 'Mag-sign Up',
    searchPlateNumber: 'Hanapin ang Plate Number',
    uploadTicketToAppeal: 'I-upload ang Tiket para Iapela',
    logout: "Mag-logout",
    // Dashboard
    welcomeBack: 'Maligayang pagbabalik,',
    manageTrafficViolationsAndAppeals: 'I-manage ang iyong mga paglabag at apela',
    outstandingFines: 'Hindi pa Bayad na Multa',
    totalViolations: 'Kabuuang Paglabag',
    underReview: 'Sinusuri',
    dismissed: 'Tinanggal',
    trafficViolations: 'Mga Paglabag',
    myVehicles: 'Aking mga Sasakyan',
    violationMap: 'Mapa ng Paglabag',
    analytics: 'Analitika',
    vehicle: 'Sasakyan',
    filterByVehicle: 'I-filter ayon sa sasakyan',
    status: 'Status',
    filterByStatus: 'I-filter ayon sa status',
    noViolationsFound: 'Walang nahanap na paglabag',
    addAVehicleToStartTrackingViolations: 'Magdagdag ng sasakyan upang masubaybayan ang mga paglabag.',
    viewMore: 'Tingnan pa',
    manageYourRegisteredVehiclesAndTheirViolations: 'I-manage ang iyong mga rehistradong sasakyan at paglabag',
    noVehiclesToBeChecked: 'Walang sasakyang mase-check',
    addVehicle: 'Magdagdag ng Sasakyan',
    viewViolations: 'Tingnan ang mga Paglabag',
    viewYourViolationsOnTheMap: 'Tingnan ang iyong mga paglabag sa mapa',
    viewYourViolationStatisticsAndTrends: 'Tingnan ang iyong mga istatistika at trend ng paglabag',
    heroDescription: "Ang iyong matalinong NCAP violation checker at traffic assistant. Tingnan ang mga paglabag, mag-upload ng ticket para sa AI analysis, at gumawa ng propesyonal na apela. Mabilis, tama, at madaling gamitin.",
    // VehicleManagement
    'vehicleManagement.title': 'Pamamahala ng Sasakyan',
    'vehicleManagement.myVehicles': 'Aking mga Sasakyan',
    'vehicleManagement.manageRegisteredVehicles': 'I-manage ang iyong mga rehistradong sasakyan',
    'vehicleManagement.addVehicle': 'Magdagdag ng Sasakyan',
    'vehicleManagement.addNewVehicle': 'Magdagdag ng Bagong Sasakyan',
    'vehicleManagement.enterVehicleDetailsBelow': 'Ilagay ang detalye ng iyong sasakyan sa ibaba',
    'vehicleManagement.plateNumber': 'Plate Number',
    'vehicleManagement.type': 'Uri',
    'vehicleManagement.selectVehicleType': 'Pumili ng uri ng sasakyan',
    'vehicleManagement.sedan': 'Sedan',
    'vehicleManagement.suv': 'SUV',
    'vehicleManagement.truck': 'Truck',
    'vehicleManagement.van': 'Van',
    'vehicleManagement.motorcycle': 'Motorsiklo',
    'vehicleManagement.brand': 'Brand',
    'vehicleManagement.model': 'Modelo',
    'vehicleManagement.year': 'Taon',
    'vehicleManagement.saveChanges': 'I-save ang mga Pagbabago',
    'vehicleManagement.editVehicle': 'I-edit ang Sasakyan',
    'vehicleManagement.updateVehicleDetails': 'I-update ang detalye ng sasakyan',
    'vehicleManagement.noVehiclesFound': 'Walang Nakitang Sasakyan',
    'vehicleManagement.noVehiclesYet': 'Wala ka pang nadagdag na sasakyan. I-click ang button sa itaas upang magdagdag.',
    // PlateSearch
    searching: 'Hinahanap',
    search: 'Hanapin',
    violationHistory: 'Kasaysayan ng Paglabag',
    ticket: 'Tiket',
    // AIAnalysis
    aiViolationAnalysis: 'AI Pagsusuri ng Paglabag',
    aiAnalysisInProgress: 'AI Pagsusuri ay Isinasagawa',
    aiAnalysisResults: 'Resulta ng AI Analysis',
    completedAnalysis: 'Natapos na ang pagsusuri gamit ang Gemini Vision AI',
    validViolation: 'Tamang Paglabag',
    possiblyUnfair: 'Posibleng Hindi Makatarungan',
    uncertain: 'Hindi Tiyak',
    issuesFound: 'Mga Natagpuang Isyu',
    recommendations: 'Mga Rekomendasyon',
    extractedInformation: 'Nakuha na Impormasyon',
    qualityChecks: 'Mga Quality Check',
    plateNumberMatch: 'Tugma ang Plate Number',
    imageQuality: 'Kalidad ng Larawan',
    generateAppealLetter: 'Gumawa ng Liham ng Apela',
    back: 'Bumalik',
    adminDashboard: "Admin Panel",
    manageAppealsAndViolations: "I-manage ang mga apela at paglabag",
    backToAppeals: "Bumalik sa Mga Apela",
    appealDetails: "Detalye ng Apela",
    reviewDetailsAndTakeAction: "Suriin ang lahat ng detalye at gumawa ng aksyon",
    ticketNumber: "Numero ng Tiket",
    plateNumber: "Plate Number",
    location: "Lokasyon",
    dateSubmitted: "Petsa ng Pagsumite",
    userName: "Pangalan ng User",
    violationType: "Uri ng Paglabag",
    appealReason: "Dahilan ng Apela",
    approve: "Aprubahan",
    deny: "Tanggihan",
    totalAppeals: "Kabuuang Apela",
    pending: "Nakabinbin",
    approved: "Inaprubahan",
    denied: "Tinanggihan",
    filterAppeals: "I-filter ang mga Apela",
    searchByTicketNameOrPlate: "Maghanap ayon sa tiket, pangalan, o plate...",
    allStatus: "Lahat ng Status",
    appealsManagement: "Pamamahala ng Apela",
    reviewAndProcessViolationAppeals: "Suriin at iproseso ang mga apela ng paglabag",
    // ...add more keys as needed
  }
};

type Language = 'en' | 'tl';

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'tl' : 'en'));
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}; 