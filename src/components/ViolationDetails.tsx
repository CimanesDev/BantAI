import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Car, FileText, CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const getStatusBadge = (status: string) => {
  const statusConfig = {
    unpaid: { label: "Unpaid", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
    under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
    dismissed: { label: "Dismissed", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
    paid: { label: "Paid", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle }
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

interface ViolationDetailsProps {
  violation: any;
  onBack: () => void;
  onAnalyze: () => void;
  onAppeal: () => void;
  onSettlePayment: () => void;
}

export const ViolationDetails = ({ violation, onBack, onAnalyze, onAppeal, onSettlePayment }: ViolationDetailsProps) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const handleSettlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const violationRef = doc(db, 'violations', violation.id);
      await updateDoc(violationRef, { 
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      toast({ 
        title: 'Payment successful', 
        description: 'Violation has been marked as paid.' 
      });
      onSettlePayment();
    } catch (err) {
      toast({ 
        title: 'Payment failed', 
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-primary/20 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Violations
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Violation Details</h1>
          <p className="text-primary/80">Review and take action on this violation</p>
        </div>
      </div>

      {/* Violation Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-primary">{violation.violationType}</CardTitle>
                <CardDescription className="text-primary/80">
                  Ticket: {violation.ticketNumber}
                </CardDescription>
              </div>
              {getStatusBadge(violation.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/80">Location</p>
                    <p className="font-medium text-primary">{violation.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/80">Date & Time</p>
                    <p className="font-medium text-primary">{new Date(violation.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/80">Vehicle</p>
                    <p className="font-medium text-primary">{violation.plateNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-destructive/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-destructive/80">Fine Amount</p>
                    <p className="font-medium text-destructive text-lg">₱{violation.fine.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">Violation Details</h3>
              <p className="text-primary/80 text-sm">
                This violation was recorded by traffic enforcement officers. You have the right to contest this violation
                by filing an appeal with supporting evidence. Payment must be made within 15 days to avoid additional penalties.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {violation.status === 'unpaid' && (
                <>
                  <Button 
                    onClick={handleSettlePayment}
                    disabled={isProcessingPayment}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Settle Payment (₱{violation.fine.toLocaleString()})
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onAnalyze}
                    className="border-primary/20 text-primary hover:bg-primary/10 flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Analyze for Appeal
                  </Button>
                </>
              )}
              {violation.status === 'under_review' && (
                <Button 
                  variant="outline" 
                  onClick={onAppeal}
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Appeal Status
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
