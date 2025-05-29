const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const firebaseConfig = require('../src/firebaseConfig.js').default;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockViolations = [
  { plateNumber: '296-XHV', violationType: 'Illegal Parking', location: 'EDSA, Quezon City', date: '2024-05-01', fine: 1000, status: 'unpaid', ticketNumber: 'NCAP-2024-000001', userId: '', createdAt: new Date() },
  { plateNumber: '296-XHV', violationType: 'Overspeeding', location: 'C5, Pasig', date: '2024-05-10', fine: 2000, status: 'unpaid', ticketNumber: 'NCAP-2024-000002', userId: '', createdAt: new Date() },
  { plateNumber: 'ZGD-605', violationType: 'Disregarding Traffic Signs', location: 'Commonwealth, QC', date: '2024-05-05', fine: 1500, status: 'unpaid', ticketNumber: 'NCAP-2024-000003', userId: '', createdAt: new Date() },
  { plateNumber: 'ABC-123', violationType: 'No Seatbelt', location: 'Ortigas, Pasig', date: '2024-05-03', fine: 500, status: 'unpaid', ticketNumber: 'NCAP-2024-000004', userId: '', createdAt: new Date() },
  { plateNumber: 'XYZ-789', violationType: 'Illegal U-Turn', location: 'Taft, Manila', date: '2024-05-04', fine: 1200, status: 'unpaid', ticketNumber: 'NCAP-2024-000005', userId: '', createdAt: new Date() },
  { plateNumber: 'DEF-456', violationType: 'Obstruction', location: 'Aurora Blvd, QC', date: '2024-05-06', fine: 800, status: 'unpaid', ticketNumber: 'NCAP-2024-000006', userId: '', createdAt: new Date() },
  { plateNumber: 'GHI-321', violationType: 'Reckless Driving', location: 'Roxas Blvd, Manila', date: '2024-05-07', fine: 2500, status: 'unpaid', ticketNumber: 'NCAP-2024-000007', userId: '', createdAt: new Date() },
  { plateNumber: 'JKL-654', violationType: 'No Plate', location: 'Makati Ave, Makati', date: '2024-05-08', fine: 1000, status: 'unpaid', ticketNumber: 'NCAP-2024-000008', userId: '', createdAt: new Date() },
  { plateNumber: 'MNO-987', violationType: 'Expired Registration', location: 'Alabang, Muntinlupa', date: '2024-05-09', fine: 2000, status: 'unpaid', ticketNumber: 'NCAP-2024-000009', userId: '', createdAt: new Date() },
  { plateNumber: 'PQR-852', violationType: 'Illegal Parking', location: 'BGC, Taguig', date: '2024-05-11', fine: 1500, status: 'unpaid', ticketNumber: 'NCAP-2024-000010', userId: '', createdAt: new Date() }
];

(async () => {
  for (const v of mockViolations) {
    await addDoc(collection(db, 'violations'), { ...v, createdAt: serverTimestamp() });
    console.log(`Added violation for plate ${v.plateNumber}`);
  }
  console.log('Mock violations added.');
  process.exit(0);
})(); 