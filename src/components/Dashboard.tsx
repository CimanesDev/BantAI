import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle, CheckCircle, Clock, FileText, Car, User, MapPin, Filter, TrendingUp, Calendar } from "lucide-react";
import { ViolationMap } from './ViolationMap';
import { ViolationChart } from './ViolationChart';
import { ViolationDetails } from './ViolationDetails';
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { useLanguage } from "@/contexts/LanguageContext";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    unpaid: { label: "Unpaid", color: "destructive", icon: AlertCircle },
    under_review: { label: "Under Review", color: "secondary", icon: Clock },
    dismissed: { label: "Dismissed", color: "outline", icon: CheckCircle },
    paid: { label: "Paid", color: "default", icon: CheckCircle }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.color as any} className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

interface DashboardProps {
  onUploadClick: () => void;
  onViolationSelect: (violation: any) => void;
  user?: any;
}

export const Dashboard = ({ onUploadClick, onViolationSelect, user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('violations');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { t } = useLanguage();
  
  // Normalization helper
  const normalizePlate = (plate: string) => plate.trim().toUpperCase().replace(/\s+/g, '');
  // Memoize normalized plate numbers for user's vehicles
  const normalizedPlateNumbers = useMemo(() =>
    Array.isArray(user?.vehicles)
      ? user.vehicles.map((v: any) => normalizePlate(v.plateNumber)).filter(Boolean)
      : []
  , [user?.vehicles && user.vehicles.map((v: any) => v.plateNumber).join(',')]);

  const filteredViolations = violations.filter(v => {
    const vehicleMatch = selectedVehicle === 'all' || v.plateNumber === normalizePlate(selectedVehicle);
    const statusMatch = selectedStatus === 'all' || v.status === selectedStatus;
    return vehicleMatch && statusMatch;
  });
  
  const stats = {
    total: filteredViolations.length,
    unpaid: filteredViolations.filter(v => v.status === 'unpaid').length,
    underReview: filteredViolations.filter(v => v.status === 'under_review').length,
    dismissed: filteredViolations.filter(v => v.status === 'dismissed').length
  };

  const totalFines = filteredViolations
    .filter(v => v.status === 'unpaid')
    .reduce((sum, v) => sum + v.fine, 0);

  const handleViolationClick = (violation: any) => {
    setSelectedViolation(violation);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedViolation(null);
  };

  const handleAnalyze = () => {
    onViolationSelect(selectedViolation);
  };

  const handleAppeal = () => {
    // Handle appeal logic
    console.log('Appeal for violation:', selectedViolation);
  };

  const handleSettlePayment = () => {
    if (selectedViolation) {
      // Update violation status to paid
      setViolations(prev => prev.map(v => 
        v.id === selectedViolation.id 
          ? { ...v, status: 'paid' }
          : v
      ));
      setViewMode('list');
      setSelectedViolation(null);
    }
  };

  useEffect(() => {
    if (!user || normalizedPlateNumbers.length === 0) {
      setViolations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Set up real-time listener for violations
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'violations'),
        where('plateNumber', 'in', normalizedPlateNumbers),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const violations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          plateNumber: normalizePlate(doc.data().plateNumber)
        }));
        setViolations(violations);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching violations:', error);
        setLoading(false);
      }
    );
    // Cleanup subscription
    return () => unsubscribe();
  }, [user?.id, normalizedPlateNumbers.join(',')]);

  if (viewMode === 'details' && selectedViolation) {
    return (
      <ViolationDetails
        violation={selectedViolation}
        onBack={handleBackToList}
        onAnalyze={handleAnalyze}
        onAppeal={handleAppeal}
        onSettlePayment={handleSettlePayment}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/20 p-3 rounded-xl">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t('welcomeBack')} {user?.name || 'User'}
                </h1>
                <p className="text-primary-foreground text-lg">
                  {t('manageTrafficViolationsAndAppeals')}
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={onUploadClick} 
            size="lg" 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Upload className="h-5 w-5 mr-2" />
            {t('uploadTicket')}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-destructive/20 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">{t('outstandingFines')}</p>
                  <p className="text-2xl font-bold text-destructive">₱{totalFines.toLocaleString()}</p>
                </div>
                <div className="bg-destructive/10 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">{t('totalViolations')}</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">{t('underReview')}</p>
                  <p className="text-2xl font-bold text-primary">{stats.underReview}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-primary/10 bg-card/80 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-1">{t('dismissed')}</p>
                  <p className="text-2xl font-bold text-primary">{stats.dismissed}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Navigation Bar */}
        <TabsList className="w-full rounded-xl bg-primary border border-primary shadow-sm flex justify-between mb-4">
          <TabsTrigger value="violations" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">{t('trafficViolations')}</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">{t('myVehicles')}</TabsTrigger>
          <TabsTrigger value="map" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">{t('violationMap')}</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">{t('analytics')}</TabsTrigger>
        </TabsList>
        {/* Filter Controls (only for violations tab) */}
        {activeTab === 'violations' && (
          <div className="flex flex-wrap gap-4 mb-4">
            {normalizedPlateNumbers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive font-medium">{t('vehicle')}:</span>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-44 border-primary focus:border-destructive">
                    <SelectValue placeholder={t('filterByVehicle')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {normalizedPlateNumbers.map((plate: string) => (
                      <SelectItem key={plate} value={plate}>
                        {plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">{t('status')}:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-44 border-primary focus:border-destructive">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <TabsContent value="violations" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredViolations.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noViolationsFound')}</h3>
              <p className="text-slate-600 mb-4">{t('addAVehicleToStartTrackingViolations')}</p>
            </div>
          ) : (
            filteredViolations.map((violation) => (
              <Card 
                key={violation.id} 
                className="border-destructive hover:border-destructive/20 transition-colors cursor-pointer group"
                onClick={() => handleViolationClick(violation)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-destructive">{violation.violationType}</h3>
                        {getStatusBadge(violation.status)}
                      </div>
                      <p className="text-sm text-destructive">{violation.ticketNumber}</p>
                      <div className="flex items-center text-sm text-destructive">
                        <MapPin className="h-4 w-4 mr-1" />
                        {violation.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">₱{violation.fine.toLocaleString()}</p>
                      <p className="text-sm text-destructive">{violation.date}</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-destructive font-medium group-hover:underline group-hover:text-destructive/80 transition">{t('viewMore')}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t('myVehicles')}</CardTitle>
              <CardDescription className="text-destructive">
                {t('manageYourRegisteredVehiclesAndTheirViolations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : normalizedPlateNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noVehiclesToBeChecked')}</h3>
                  <p className="text-slate-600 mb-4">{t('addAVehicleToStartTrackingViolations')}</p>
                  <Button>{t('addVehicle')}</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {normalizedPlateNumbers.map((plate: string, index: number) => {
                    const vehicleViolations = violations.filter(v => v.plateNumber === plate);
                    return (
                      <Card key={index} className="border-destructive hover:border-destructive/20 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-slate-100 p-3 rounded-xl">
                              <Car className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-lg">{plate}</p>
                              <p className="text-sm text-slate-600">{vehicleViolations[0]?.brand} {vehicleViolations[0]?.model}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-600">
                              {vehicleViolations.length} violation{vehicleViolations.length !== 1 ? 's' : ''}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVehicle(plate)}
                            >
                              {t('viewViolations')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t('violationMap')}</CardTitle>
              <CardDescription className="text-destructive">
                {t('viewYourViolationsOnTheMap')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ViolationMap
                violations={filteredViolations.map(v => ({
                  ...v,
                  lat: v.coordinates?.lat ?? 0,
                  lng: v.coordinates?.lng ?? 0,
                  plate: v.plateNumber ?? '',
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t('analytics')}</CardTitle>
              <CardDescription className="text-destructive">
                {t('viewYourViolationStatisticsAndTrends')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ViolationChart violations={filteredViolations} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
