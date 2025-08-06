/** 
 * Authentication page with dynamic view switching (login/register)
 * Displays benefits for users and integrates with landing page routing
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

// Login form as a separate component
function LoginForm() {
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
    <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}
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
              className="dark:text-foreground"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-login">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
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
              className="dark:text-foreground"
            />
          </div>
      <Button type="submit" className="w-full bg-[#184A47] hover:bg-[#123a38]" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
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
    <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="dark:text-foreground"
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
              className="dark:text-foreground"
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
              className="dark:text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="dark:text-foreground"
            />
          </div>
      <Button type="submit" className="w-full bg-[#184A47] hover:bg-[#123a38]" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
  );
}

// Main AuthPage component
const AuthPage = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState<string>("login");

  // Check if we have an initial view from the landing page
  useEffect(() => {
    const state = location.state as { initialView?: string } | null;
    if (state?.initialView === "register") {
      setActiveView("register");
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-[#DDE9E8] dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-[#DDE9E8] dark:bg-gray-900 p-4 z-10 shadow-sm dark:shadow-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-semibold text-[#184A47] dark:text-white">
            <img src="/assets/images/moniflow-logo.svg" alt="Moniflow Logo" height="28" width="28" />
            <span className="text-xl font-sora">Moniflow</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left side - Hero text */}
            <div className="flex flex-col justify-center p-6">
              <h1 className="text-4xl font-bold text-[#184A47] dark:text-white mb-4 font-montserrat">
                {activeView === "login" 
                  ? "Welcome back!"
                  : "Start your financial journey"
                }
              </h1>
              <p className="text-lg text-[#184A47] dark:text-gray-300 mb-6 font-poppins">
                {activeView === "login"
                  ? "Sign in to your account to manage your finances and track your budget with ease."
                  : "Create an account to start tracking your expenses, setting budgets, and achieving your financial goals."
                }
              </p>
              
              {/* Benefits section instead of screenshot */}
              <div className="bg-white/80 dark:bg-gray-800 rounded-xl p-6 border border-[#184A47]/10 dark:border-gray-700 shadow-md">
                <h3 className="text-xl font-semibold text-[#184A47] dark:text-white mb-4 font-montserrat">
                  {activeView === "login" 
                    ? "Your financial dashboard awaits"
                    : "Join thousands already saving money"
                  }
                </h3>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#184A47] dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Track expenses and income in one place</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#184A47] dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Create custom budgets for your spending</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#184A47] dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Visualize spending with beautiful charts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-[#184A47] dark:text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Set and achieve your financial goals</span>
                  </li>
                </ul>
                
                {/* Trust indicator */}
                <div className="flex items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                  <img 
                    src="/assets/images/trusted-users.png" 
                    alt="Trusted Users" 
                    className="w-24 h-8 mr-3" 
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Trusted by 30,000+ users worldwide</p>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Authentication form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {/* Mobile tab switcher */}
              <div className="mb-6 flex border dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeView === 'login' 
                      ? 'bg-[#184A47] text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveView('login')}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeView === 'register' 
                      ? 'bg-[#184A47] text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveView('register')}
                >
                  Create Account
                </button>
              </div>
              
              {/* Authentication forms */}
              <div>
                <h2 className="text-2xl font-bold mb-2 text-[#292930] dark:text-white font-montserrat">
                  {activeView === 'login' ? 'Sign in to your account' : 'Create a new account'}
                </h2>
                <p className="text-[#555555] dark:text-gray-300 mb-6 font-poppins">
                  {activeView === 'login' 
                    ? 'Enter your credentials below'
                    : 'Fill in your information to get started'
                  }
                </p>
                
                {activeView === 'login' ? <LoginForm /> : <RegisterForm />}
                
                {/* Form switcher at bottom */}
                <div className="mt-6 text-center">
                  {activeView === 'login' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setActiveView('register')}
                        className="text-[#184A47] dark:text-green-400 font-medium hover:underline"
                      >
                        Create one now
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <button 
                        onClick={() => setActiveView('login')}
                        className="text-[#184A47] dark:text-green-400 font-medium hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 