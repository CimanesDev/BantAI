import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Car, AlertCircle, CheckCircle, Clock, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const mockSearchResults = [
  {
    id: 1,
    plateNumber: "ABC-1234",
    vehicleInfo: {
      brand: "Toyota",
      model: "Vios",
      year: "2020"
    },
    violations: [
      {
        ticketNumber: "NCAP-2024-001234",
        violationType: "Illegal Parking",
        location: "EDSA, Quezon City",
        date: "2024-01-15",
        fine: 1000,
        status: "unpaid"
      },
      {
        ticketNumber: "NCAP-2024-001235",
        violationType: "Overspeeding",
        location: "Commonwealth Ave",
        date: "2024-01-10",
        fine: 2000,
        status: "paid"
      }
    ]
  }
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    unpaid: { label: "Hindi pa Bayad", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
    under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
    dismissed: { label: "Dismissed", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
    paid: { label: "Bayad na", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
  const Icon = config.icon;
  
  return (
    <Badge className={`flex items-center space-x-1 ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

interface PlateSearchProps {
  onBack?: () => void;
}

export const PlateSearch = ({ onBack }: PlateSearchProps) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plateNumber.trim()) {
      setError("Please enter a plate number");
      return;
    }
    const formattedPlate = plateNumber.trim().toUpperCase().replace(/\s+/g, '');
    setIsLoading(true);
    try {
      // Query violations by plate number
      const violationsRef = collection(db, 'violations');
      const q = query(violationsRef, where('plateNumber', '==', formattedPlate));
      const querySnapshot = await getDocs(q);
      const violations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (violations.length > 0) {
        // Optionally fetch vehicle info from vehicles collection
        let vehicleInfo = { brand: '', model: '', year: '' };
        const vehiclesRef = collection(db, 'vehicles');
        const vq = query(vehiclesRef, where('plateNumber', '==', formattedPlate));
        const vSnap = await getDocs(vq);
        if (!vSnap.empty) {
          const vData = vSnap.docs[0].data();
          vehicleInfo = { brand: vData.brand, model: vData.model, year: vData.year };
        }
        setSearchResults({ plateNumber: formattedPlate, vehicleInfo, violations });
        toast({ title: "Search successful", description: `Found violations for plate number ${formattedPlate}` });
      } else {
        setError("No violations found for this plate number");
        setSearchResults(null);
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const totalUnpaid = searchResults?.violations
    ?.filter((v: any) => v.status === 'unpaid')
    ?.reduce((sum: number, v: any) => sum + v.fine, 0) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <h2 className="text-2xl font-bold text-primary">Search Plate Number</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card/80 backdrop-blur-lg border border-primary/10 rounded-2xl shadow-lg p-6"
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full">
              <Input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="Enter plate number (e.g., ABC-1234)"
                className="border-primary focus:border-primary/40 focus:ring-primary text-primary bg-background h-12"
                disabled={isLoading}
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
      
      {searchResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Vehicle Info Card */}
          <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{searchResults.plateNumber}</h3>
                  <p className="text-primary/80">
                    {searchResults.vehicleInfo.brand} {searchResults.vehicleInfo.model} ({searchResults.vehicleInfo.year})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Violations Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Total Violations</p>
                    <p className="text-2xl font-bold text-primary">{searchResults.violations.length}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/10 bg-card/80 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">Outstanding Fines</p>
                    <p className="text-2xl font-bold text-destructive">₱{totalUnpaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Violations List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Violation History</h3>
            {searchResults.violations.map((violation: any, index: number) => (
              <Card key={index} className="border-primary/10 bg-card/80 backdrop-blur-lg hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-primary">{violation.violationType}</h3>
                        {getStatusBadge(violation.status)}
                      </div>
                      <p className="text-primary/80">Ticket: {violation.ticketNumber}</p>
                      <div className="flex items-center text-sm text-primary/80">
                        <FileText className="h-4 w-4 mr-1" />
                        {violation.location}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-destructive font-semibold text-lg">₱{violation.fine.toLocaleString()}</span>
                      <span className="text-primary/80 text-sm">{violation.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
