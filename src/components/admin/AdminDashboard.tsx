import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, CheckCircle, AlertCircle, Search, Filter, Info, Shield, Camera, Car, MapPin, Calendar, User, Ticket, ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-primary/60 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-primary/80">{label}</p>
      <p className="text-sm text-primary">{value}</p>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

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
    const analysisResult = selectedAppeal.analysisResult || {};
    const issues = analysisResult.issues || [];
    const confidence = analysisResult.confidence || 0;
    const imageQuality = analysisResult.imageQuality || 'Unknown';
    const plateNumberMatch = analysisResult.plateNumberMatch || false;

    return (
      <div className="space-y-6 min-h-screen bg-background p-4">
        <Button variant="outline" onClick={() => setSelectedAppeal(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToAppeals')}
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Appeal Details */}
          <Card className="lg:col-span-2 border-primary/10 bg-card/80 backdrop-blur-lg shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-primary">{t('appealDetails')}</CardTitle>
                  <CardDescription className="text-primary">{t('reviewDetailsAndTakeAction')}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {getAIVerdictBadge(selectedAppeal.aiVerdict)}
                  {getStatusBadge(selectedAppeal.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Violation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Ticket}
                  label={t('ticketNumber')}
                  value={selectedAppeal.ticketNumber}
                />
                <DetailItem
                  icon={Car}
                  label={t('plateNumber')}
                  value={selectedAppeal.plateNumber}
                />
                <DetailItem
                  icon={MapPin}
                  label={t('location')}
                  value={selectedAppeal.location}
                />
                <DetailItem
                  icon={Calendar}
                  label={t('dateSubmitted')}
                  value={selectedAppeal.submittedDate ? new Date(selectedAppeal.submittedDate.seconds * 1000).toLocaleString('en-PH') : 'N/A'}
                />
                <DetailItem
                  icon={User}
                  label={t('userName')}
                  value={selectedAppeal.userName}
                />
                <DetailItem
                  icon={Info}
                  label={t('violationType')}
                  value={selectedAppeal.violationType}
                />
              </div>

              {/* Appeal Reason */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">{t('appealReason')}</h3>
                <p className="text-sm text-primary/80 whitespace-pre-wrap">{selectedAppeal.appealReason}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleStatusChange(selectedAppeal.id, 'approved')} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('approve')}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleStatusChange(selectedAppeal.id, 'denied')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {t('deny')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleStatusChange(selectedAppeal.id, 'under_review')}
                >
                  <Info className="h-4 w-4 mr-2" />
                  {t('underReview')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Card */}
          <Card className="border-primary/10 bg-card/80 backdrop-blur-lg shadow-xl">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AI Analysis
              </CardTitle>
              <CardDescription>AI-powered violation analysis results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Confidence Score */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Confidence Score</h3>
                <div className="w-full bg-primary/10 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
                <p className="text-sm text-primary/80 mt-1">{confidence}% confidence in analysis</p>
              </div>

              {/* Image Quality */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Image Quality</h3>
                <p className="text-sm text-primary/80">{imageQuality}</p>
              </div>

              {/* Plate Number Verification */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Plate Number Verification</h3>
                <p className="text-sm text-primary/80">
                  {plateNumberMatch ? '✅ Verified' : '❌ Unverified'}
                </p>
              </div>

              {/* Identified Issues */}
              {issues.length > 0 && (
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">Identified Issues</h3>
                  <ul className="space-y-2">
                    {issues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm text-primary/80 flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-primary/60" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-background p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">{t('adminDashboard')}</h1>
        <p className="text-primary/80 mt-2">{t('manageAppealsAndViolations')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalAppeals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('denied')}</CardTitle>
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
            <span>{t('filterAppeals')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder={t('searchByTicketNameOrPlate')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="approved">{t('approved')}</SelectItem>
                <SelectItem value="denied">{t('denied')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appeals List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('appealsManagement')}</CardTitle>
          <CardDescription>
            {t('reviewAndProcessViolationAppeals')}
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
                    <p className="text-sm text-gray-600">{t('ticket')}: {appeal.ticketNumber}</p>
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
                  <div>📅 {new Date(appeal.submittedDate.seconds * 1000).toLocaleDateString('en-PH')}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm"><strong>{t('appealReason')}:</strong> {appeal.appealReason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
