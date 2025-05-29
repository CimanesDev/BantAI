import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Document, Page, pdfjs } from 'react-pdf';
import jsPDF from 'jspdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const getStatusBadge = (status: string) => {
  const config = {
    pending: { label: 'Pending', color: 'default', icon: AlertCircle },
    approved: { label: 'Approved', color: 'secondary', icon: CheckCircle },
    denied: { label: 'Denied', color: 'destructive', icon: AlertCircle },
    under_review: { label: 'Under Review', color: 'outline', icon: AlertCircle }
  };
  
  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.pending;
  
  return (
    <Badge variant={color as any} className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
};

const getAIVerdictBadge = (verdict: string) => {
  const config = {
    valid: { label: 'Valid', color: 'destructive' },
    uncertain: { label: 'Uncertain', color: 'default' },
    possibly_unfair: { label: 'Possibly Unfair', color: 'secondary' }
  };
  
  const { label, color } = config[verdict as keyof typeof config] || config.valid;
  
  return (
    <Badge variant={color as any}>
      {label}
    </Badge>
  );
};

// Helper to generate PDF ArrayBuffer from appealReason
function getAppealPdfArrayBuffer(appealReason: string) {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(appealReason, 180);
  doc.text(lines, 15, 20);
  return doc.output('arraybuffer');
}

export const AdminDashboard = () => {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const appealsRef = collection(db, 'appeals');
    const q = query(appealsRef, orderBy('submittedDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppeals(appealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    totalAppeals: appeals.length,
    pending: appeals.filter(a => a.status === 'pending').length,
    approved: appeals.filter(a => a.status === 'approved').length,
    denied: appeals.filter(a => a.status === 'denied').length
  };

  const filteredAppeals = appeals.filter(appeal => {
    const matchesSearch = appeal.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appeal.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appeal.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appeal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (appealId: string, newStatus: string) => {
    try {
      const appealRef = doc(db, 'appeals', appealId);
      await updateDoc(appealRef, { status: newStatus });
      
      // Also update the corresponding violation status
      const appeal = appeals.find(a => a.id === appealId);
      if (appeal?.violationId) {
        const violationRef = doc(db, 'violations', appeal.violationId);
        await updateDoc(violationRef, { 
          status: newStatus === 'approved' ? 'dismissed' : 
                 newStatus === 'denied' ? 'unpaid' : 'under_review'
        });
      }

      toast({
        title: "Success",
        description: `Appeal ${newStatus} successfully`
      });
    } catch (error) {
      console.error('Error updating appeal status:', error);
      toast({
        title: "Error",
        description: "Failed to update appeal status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedAppeal) {
    // Use appealLetter if available, otherwise try analysisResult or a fallback
    const pdfContent = selectedAppeal.appealLetter || selectedAppeal.appealReason || (selectedAppeal.analysisResult && JSON.stringify(selectedAppeal.analysisResult, null, 2)) || 'No letter available.';
    return (
      <div className="space-y-6 min-h-screen bg-background p-4">
        <Button variant="outline" onClick={() => setSelectedAppeal(null)} className="mb-4">Back to Appeals</Button>
        <Card className="border-primary/10 bg-card/80 backdrop-blur-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-primary">Appeal Details</CardTitle>
            <CardDescription className="text-primary">Review all details and take action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-primary">Ticket Number:</p>
                <p>{selectedAppeal.ticketNumber}</p>
                <p className="font-semibold mt-2 text-primary">Violation Type:</p>
                <p>{selectedAppeal.violationType}</p>
                <p className="font-semibold mt-2 text-primary">Plate Number:</p>
                <p>{selectedAppeal.plateNumber}</p>
                <p className="font-semibold mt-2 text-primary">Location:</p>
                <p>{selectedAppeal.location}</p>
                <p className="font-semibold mt-2 text-primary">Date Submitted:</p>
                <p>{selectedAppeal.submittedDate ? new Date(selectedAppeal.submittedDate.seconds * 1000).toLocaleString('en-PH') : 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-primary">User Name:</p>
                <p>{selectedAppeal.userName}</p>
                <p className="font-semibold mt-2 text-primary">User ID:</p>
                <p>{selectedAppeal.userId}</p>
                <p className="font-semibold mt-2 text-primary">AI Verdict:</p>
                <p>{selectedAppeal.aiVerdict}</p>
                <p className="font-semibold mt-2 text-primary">Status:</p>
                {getStatusBadge(selectedAppeal.status)}
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded mb-3">
              <p className="text-sm text-primary"><strong>Appeal Reason:</strong> {selectedAppeal.appealReason}</p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleStatusChange(selectedAppeal.id, 'approved')} className="bg-green-600 hover:bg-green-700">Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => handleStatusChange(selectedAppeal.id, 'denied')}>Deny</Button>
              <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedAppeal.id, 'under_review')}>Under Review</Button>
            </div>
            {pdfContent && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2 text-primary">Appeal Letter PDF Preview</h4>
                <div className="border rounded bg-white p-2">
                  <Document file={{ data: getAppealPdfArrayBuffer(pdfContent) }}>
                    <Page pageNumber={1} />
                  </Document>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-background p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-primary/80 mt-2">Manage appeals and violations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Appeals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Appeals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by ticket number, name, or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appeals List */}
      <Card>
        <CardHeader>
          <CardTitle>Appeals Management</CardTitle>
          <CardDescription>
            Review and process violation appeals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
                onClick={() => setSelectedAppeal(appeal)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{appeal.violationType}</h3>
                    <p className="text-sm text-gray-600">Ticket: {appeal.ticketNumber}</p>
                  </div>
                  <div className="flex space-x-2">
                    {getAIVerdictBadge(appeal.aiVerdict)}
                    {getStatusBadge(appeal.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                  <div>👤 {appeal.userName}</div>
                  <div>🚗 {appeal.plateNumber}</div>
                  <div>📍 {appeal.location}</div>
                  <div>📅 {new Date(appeal.submittedDate).toLocaleDateString('en-PH')}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm"><strong>Appeal Reason:</strong> {appeal.appealReason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
