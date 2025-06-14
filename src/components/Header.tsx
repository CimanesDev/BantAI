import { Button } from "@/components/ui/button";
import { Shield, Menu, User, LogOut, Settings, Home, Upload, Search, Car } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setAuthView?: (view: 'login' | 'signup') => void;
  user?: any;
  isAdmin?: boolean;
  onLogout: () => void;
}

export const Header = ({ currentView, setCurrentView, setAuthView, user, isAdmin, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const navItems = user ? (
    isAdmin ? [
      { id: 'admin', label: t('home'), icon: Settings }
    ] : [
      { id: 'dashboard', label: t('home'), icon: Home },
      { id: 'upload', label: t('uploadTicket'), icon: Upload },
      { id: 'vehicles', label: t('searchPlateNumber'), icon: Car },
      { id: 'seed', label: t('seedData'), icon: Upload },
    ]
  ) : [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'search', label: t('searchViolations'), icon: Search },
    { id: 'upload', label: t('uploadTicket'), icon: Upload },
    { id: 'seed', label: t('seedData'), icon: Upload },
  ];

  const handleLoginClick = () => {
    setCurrentView('login');
    setAuthView?.('login');
  };

  const handleSignupClick = () => {
    setCurrentView('signup');
    setAuthView?.('signup');
  };

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentView(user ? 'dashboard' : 'home')}
          >
            <img src="/images/bantai.png" alt="BantAI Logo" className="h-14 w-auto object-contain max-h-16" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setCurrentView(item.id)}
                  className={isActive 
                    ? "bg-[#0d3b86] text-white hover:bg-[#1a4e9b]" 
                    : "text-[#0d3b86] hover:text-[#0d3b86] hover:bg-[#fcf9f6]"
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* EN | TL Toggle Button */}
            <Button
              variant="outline"
              onClick={toggleLanguage}
              className="border-[#0d3b86]/20 text-[#0d3b86] hover:bg-[#fcf9f6] hover:text-[#0d3b86] font-bold"
            >
              {language === 'en' ? 'EN' : 'TL'}
            </Button>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-[#0d3b86]">{user.name}</p>
                  <p className="text-xs text-[#0d3b86]">{user.email}</p>
                </div>
                <div className="bg-[#fcf9f6] p-2 rounded-full">
                  <User className="h-5 w-5 text-[#0d3b86]" />
                </div>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="border-[#0d3b86]/20 text-[#b61c24] hover:bg-[#fcf9f6] hover:text-[#b61c24]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className="border-[#0d3b86]/20 text-[#0d3b86] hover:bg-[#fcf9f6] hover:text-[#0d3b86]"
                >
                  {t('login')}
                </Button>
                <Button
                  onClick={handleSignupClick}
                  className="bg-[#0d3b86] text-white hover:bg-[#1a4e9b]"
                >
                  {t('signUp')}
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-[#0d3b86] hover:text-[#0d3b86] hover:bg-[#fcf9f6]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-blue-100 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`justify-start ${isActive 
                      ? "bg-[#0d3b86] text-white" 
                      : "text-[#0d3b86] hover:text-[#0d3b86] hover:bg-[#fcf9f6]"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
