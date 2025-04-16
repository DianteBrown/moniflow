import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Login form as a separate component
function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const response = await authService.login({ email, password });
      
      // Log the response and token
      console.log('Login response:', response);
      console.log('Token after login:', localStorage.getItem('token'));
      
      // Successfully logged in and token stored
      toast.success('Login successful!');
      
      // Force token storage
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        // Add a delay before navigation to ensure the toast is seen and token is stored
        setTimeout(() => {
          console.log('Navigating to dashboard with token:', localStorage.getItem('token'));
          window.location.href = '/dashboard'; // Use direct navigation instead of navigate()
        }, 500);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Direct error handling approach
      if (axios.isAxiosError(error)) {
        // Set the error message directly in the UI
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response?.status === 401) {
          setErrorMessage('Invalid email or password');
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Login failed. Please try again.');
        }
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border dark:border-gray-800">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input
              id="email-login"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-login">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password-login"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 font-normal text-sm w-full"
              onClick={() => navigate('/forgot-password')}
              type="button"
            >
              Can't access your account? Reset your password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Register form as a separate component
function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        name,
        email,
        password,
      });
      
      // Log the response and token
      console.log('Registration response:', response);
      console.log('Token after registration:', localStorage.getItem('token'));
      
      // Force token storage
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        // Successfully registered and token stored
        toast.success('Registration successful!');
        
        // Add a delay before navigation to ensure the toast is seen and token is stored
        setTimeout(() => {
          console.log('Navigating to dashboard with token:', localStorage.getItem('token'));
          window.location.href = '/dashboard'; // Use direct navigation instead of navigate()
        }, 500);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      // Direct error handling approach
      if (axios.isAxiosError(error)) {
        // Set the error message directly in the UI
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border dark:border-gray-800">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-register">Email</Label>
            <Input
              id="email-register"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-register">Password</Label>
            <Input
              id="password-register"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Mobile toggle component
function MobileAuthToggle({ activeView, onViewChange }: { activeView: string, onViewChange: (view: string) => void }) {
  return (
    <div className="flex border rounded-md overflow-hidden mb-6">
      <button
        className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
          activeView === 'login' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-transparent hover:bg-muted'
        }`}
        onClick={() => onViewChange('login')}
      >
        Login
      </button>
      <button
        className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
          activeView === 'register' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-transparent hover:bg-muted'
        }`}
        onClick={() => onViewChange('register')}
      >
        Register
      </button>
    </div>
  );
}

// Main AuthPage component
const AuthPage = () => {
  const [mobileView, setMobileView] = useState<string>("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl">
        <Card className="border dark:border-gray-800 mb-8">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold">Moniflow</CardTitle>
            <CardDescription>Budget management made simple</CardDescription>
          </CardHeader>
        </Card>

        {/* Mobile view (Toggle UI) */}
        <div className="md:hidden">
          <MobileAuthToggle 
            activeView={mobileView}
            onViewChange={setMobileView}
          />
          {mobileView === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Desktop view (Side by side) */}
        <div className="hidden md:flex md:gap-6">
          <div className="flex-1">
            <LoginForm />
          </div>
          <div className="flex-1">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 