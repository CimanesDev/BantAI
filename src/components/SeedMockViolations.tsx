import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mockViolations = [
  { plateNumber: '296-XHV', violationType: 'Illegal Parking', location: 'EDSA, Quezon City', date: '2024-05-01', fine: 1000, status: 'unpaid', ticketNumber: 'NCAP-2024-000001', coordinates: { lat: 14.6325, lng: 121.0437 } },
  { plateNumber: '296-XHV', violationType: 'Overspeeding', location: 'C5, Pasig', date: '2024-05-10', fine: 2000, status: 'unpaid', ticketNumber: 'NCAP-2024-000002', coordinates: { lat: 14.5616, lng: 121.0786 } },
  { plateNumber: 'ZGD-605', violationType: 'Disregarding Traffic Signs', location: 'Commonwealth, QC', date: '2024-05-05', fine: 1500, status: 'unpaid', ticketNumber: 'NCAP-2024-000003', coordinates: { lat: 14.7041, lng: 121.0492 } },
  { plateNumber: 'ABC-123', violationType: 'No Seatbelt', location: 'Ortigas, Pasig', date: '2024-05-03', fine: 500, status: 'unpaid', ticketNumber: 'NCAP-2024-000004', coordinates: { lat: 14.5876, lng: 121.0636 } },
  { plateNumber: 'XYZ-789', violationType: 'Illegal U-Turn', location: 'Taft, Manila', date: '2024-05-04', fine: 1200, status: 'unpaid', ticketNumber: 'NCAP-2024-000005', coordinates: { lat: 14.5611, lng: 120.9947 } },
  { plateNumber: 'DEF-456', violationType: 'Obstruction', location: 'Aurora Blvd, QC', date: '2024-05-06', fine: 800, status: 'unpaid', ticketNumber: 'NCAP-2024-000006', coordinates: { lat: 14.6197, lng: 121.0531 } },
  { plateNumber: 'GHI-321', violationType: 'Reckless Driving', location: 'Roxas Blvd, Manila', date: '2024-05-07', fine: 2500, status: 'unpaid', ticketNumber: 'NCAP-2024-000007', coordinates: { lat: 14.5553, lng: 120.9830 } },
  { plateNumber: 'JKL-654', violationType: 'No Plate', location: 'Makati Ave, Makati', date: '2024-05-08', fine: 1000, status: 'unpaid', ticketNumber: 'NCAP-2024-000008', coordinates: { lat: 14.5614, lng: 121.0270 } },
  { plateNumber: 'MNO-987', violationType: 'Beating the Red Light', location: 'Quezon Ave, QC', date: '2024-05-09', fine: 3000, status: 'unpaid', ticketNumber: 'NCAP-2024-000009', coordinates: { lat: 14.6467, lng: 121.0425 } },
  { plateNumber: 'PQR-852', violationType: 'Counterflow', location: 'España, Manila', date: '2024-05-11', fine: 3500, status: 'unpaid', ticketNumber: 'NCAP-2024-000010', coordinates: { lat: 14.6091, lng: 120.9902 } },
];

export function SeedMockViolations() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      for (const v of mockViolations) {
        await addDoc(collection(db, 'violations'), { ...v, createdAt: serverTimestamp() });
      }
      setResult('Mock violations added successfully!');
    } catch (err: any) {
      setResult('Error adding mock violations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Seed Mock Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading ? 'Seeding...' : 'Add 10 Mock Violations'}
          </Button>
          {result && <div className="text-center text-primary mt-2">{result}</div>}
        </CardContent>
      </Card>
    </div>
  );
} 