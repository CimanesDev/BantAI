import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { ViolationUpload } from '../components/ViolationUpload';
import { AIAnalysis } from '../components/AIAnalysis';
import { AppealGenerator } from '../components/AppealGenerator';
import { PlateSearch } from '../components/PlateSearch';
import { VehicleManagement } from '../components/VehicleManagement';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AIChat } from '../components/AIChat';
import { LandingHero } from '../components/LandingHero';
import { SeedMockViolations } from '../components/SeedMockViolations';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [currentView, setCurrentView] = useState('home');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const { t } = useLanguage();

  const handleLogin = async (userData: any) => {
    setIsUserDataLoading(true);
    // Fetch vehicles for the user from Firestore
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const q = query(vehiclesRef, where('userId', '==', userData.id));
      const querySnapshot = await getDocs(q);
      const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUser({ ...userData, vehicles: vehiclesData });
    } catch (err) {
      setUser(userData); // fallback
    } finally {
      setCurrentView('dashboard');
      setIsUserDataLoading(false);
      // Check if admin
      if (userData.email === 'admin@ncap.gov.ph' || userData.email === 'cimanesdev@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentView('home');
  };

  const handleViolationSelect = (violation: any) => {
    setSelectedViolation(violation);
    setCurrentView('analysis');
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setCurrentView('appeal');
  };

  const handleVehiclesUpdate = (vehicles: any[]) => {
    if (user) {
      setUser({ ...user, vehicles });
    }
  };

  // Auth views
  if (!user && (currentView === 'login' || currentView === 'signup')) {
    if (authView === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView('signup')}
          onBack={() => setCurrentView('home')}
        />
      );
    } else {
      return (
        <SignupForm
          onSignup={handleLogin}
          onSwitchToLogin={() => setAuthView('login')}
          onBack={() => setCurrentView('home')}
        />
      );
    }
  }

  if (isUserDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mr-4"></div>
        <span className="text-lg text-primary">Loading your dashboard...</span>
      </div>
    );
  }

  const renderCurrentView = () => {
    if (isAdmin) {
      return <AdminDashboard />;
    }

    switch (currentView) {
      case 'home':
        return user ? (
          <Dashboard
            onUploadClick={() => setCurrentView('upload')}
            onViolationSelect={handleViolationSelect}
            user={user}
          />
        ) : (
          <LandingHero 
            onSearchClick={() => setCurrentView('search')}
            onUploadClick={() => setCurrentView('upload')}
          />
        );
      case 'search':
        return <PlateSearch onBack={() => setCurrentView('home')} />;
      case 'login':
        setAuthView('login');
        return null;
      case 'signup':
        setAuthView('signup');
        return null;
      case 'upload':
        return <ViolationUpload onBack={() => setCurrentView(user ? 'dashboard' : 'home')} user={user} />;
      case 'analysis':
        return (
          <AIAnalysis
            violation={selectedViolation}
            onAnalysisComplete={handleAnalysisComplete}
            onBack={() => setCurrentView(user ? 'dashboard' : 'home')}
          />
        );
      case 'appeal':
        return (
          <AppealGenerator
            violation={selectedViolation}
            analysisResult={analysisResult}
            onBack={() => setCurrentView(user ? 'dashboard' : 'home')}
          />
        );
      case 'vehicles':
        return <VehicleManagement user={user} onVehiclesUpdate={handleVehiclesUpdate} />;
      case 'dashboard':
        return (
          <Dashboard
            onUploadClick={() => setCurrentView('upload')}
            onViolationSelect={handleViolationSelect}
            user={user}
          />
        );
      case 'seed':
        return <SeedMockViolations />;
      default:
        return user ? (
          <Dashboard
            onUploadClick={() => setCurrentView('upload')}
            onViolationSelect={handleViolationSelect}
            user={user}
          />
        ) : (
          <LandingHero 
            onSearchClick={() => setCurrentView('search')}
            onUploadClick={() => setCurrentView('upload')}
          />
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          setAuthView={setAuthView}
          user={user}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-4 py-6">
          {renderCurrentView()}
        </main>
      </div>
      <AIChat />
    </>
  );
};

export default Index;
