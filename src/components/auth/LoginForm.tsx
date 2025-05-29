import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (userData: any) => void;
  onSwitchToSignup: () => void;
  onBack: () => void;
}

export const LoginForm = ({ onLogin, onSwitchToSignup, onBack }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let profile = userDoc.exists() ? userDoc.data() : {};
      onLogin({
        id: user.uid,
        email: user.email,
        name: profile.name || user.email,
        vehicles: profile.vehicles || [],
        ...profile
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast({ title: 'Login failed', description: err.message, });
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl text-primary">Login</CardTitle>
            <CardDescription className="text-primary">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-primary focus:border-primary/40 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 border-primary focus:border-primary/40 focus:ring-primary"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-primary" />
                    ) : (
                      <Eye className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={onSwitchToSignup}
                className="text-primary hover:text-primary/80"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
