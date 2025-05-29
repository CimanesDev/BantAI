import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface SignupFormProps {
  onSignup: (user: any) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export const SignupForm = ({ onSignup, onSwitchToLogin, onBack }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email: user.email,
        vehicles: [],
      });
      onSignup({
        id: user.uid,
        email: user.email,
        name,
        vehicles: [],
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      toast({ title: 'Signup failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 text-primary hover:text-primary/80 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/10 bg-card/80 backdrop-blur-lg shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-primary">Sign Up</CardTitle>
            <CardDescription className="text-primary">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Juan"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Cruz"
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="juan@email.com"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80"
              >
                Already have an account? Log in
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
