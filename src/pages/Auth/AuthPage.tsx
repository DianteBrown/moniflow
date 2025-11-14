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
import { googleAuthService } from '../../services/googleAuthService';

// Login form as a separate component
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
        googleAuthService.renderButton('google-signin-button');
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };

    initGoogleAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const response = await authService.login({ email, password });

      // Successfully logged in and token stored
      toast.success('Login successful!');

      // Force token storage
      if (response && response.token) {
        localStorage.setItem('token', response.token);

        // Add a delay before navigation to ensure the toast is seen and token is stored
        setTimeout(() => {
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
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email-login" style={{ color: 'var(--heritage-green)' }}>Email</Label>
        <Input
          id="email-login"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password-login" style={{ color: 'var(--heritage-green)' }}>Password</Label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--heritage-gold)' }}

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
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>
      <Button type="submit" className="w-full" style={{ backgroundColor: 'var(--heritage-green)', color: 'white' }} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ backgroundColor: 'var(--heritage-warm-bg)', color: 'var(--text-gray)' }}>Or continue with</span>
          </div>
        </div>

        <div className="mt-6 justify-center items-center" >
          <div id="google-signin-button" className="justify-center items-center flex w-full"></div>
        </div>
      </div>
    </form>
  );
}

// Register form as a separate component
function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneBlurred, setPhoneBlurred] = useState(false);

  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
        googleAuthService.renderButton('google-signin-button-register');
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };

    initGoogleAuth();
  }, []);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '').replace(/^1/, '');

    // Format for US/Canada: +1 (XXX) XXX-XXXX
    if (phoneNumber.length === 0) {
      return '';
    } else if (phoneNumber.length <= 3) {
      return `+1 (${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // US/Canada phone number validation with +1 prefix
    // Must be exactly 10 digits (excluding formatting and +1 prefix)
    // Format: +1 (XXX) XXX-XXXX
    const cleanPhone = phone.replace(/\D/g, '');
    // Remove the '1' prefix if it exists (from +1)
    const phoneDigits = cleanPhone.startsWith('1') ? cleanPhone.slice(1) : cleanPhone;
    return phoneDigits.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(phoneDigits);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone_number(formatted);
  };

  const handlePhoneBlur = () => {
    setPhoneBlurred(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone_number)) {
      setErrorMessage('Please enter a valid US/Canada phone number (e.g., +1 (555) 123-4567)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        name,
        email,
        phone_number,
        password,
      });

      // Force token storage
      if (response && response.token) {
        localStorage.setItem('token', response.token);

        // Successfully registered and token stored
        toast.success('Registration successful!');

        // Add a delay before navigation to ensure the toast is seen and token is stored
        setTimeout(() => {
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
        <Label htmlFor="name" style={{ color: 'var(--heritage-green)' }}>Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number" style={{ color: 'var(--heritage-green)' }}>Phone Number</Label>
        <div className="relative">
          <Input
            id="phone_number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phone_number}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            required
            className={`text-white ${phoneBlurred && phone_number && !validatePhoneNumber(phone_number)
              ? 'border-red-500 focus:border-red-500'
              : phone_number && !validatePhoneNumber(phone_number)
                ? 'border-yellow-500 focus:border-yellow-500'
                : ''
              }`}
          />
          {phoneBlurred && phone_number && !validatePhoneNumber(phone_number) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        {phone_number && !validatePhoneNumber(phone_number) && (
          <p className={`text-sm ${phoneBlurred ? 'text-red-500' : 'text-yellow-600'}`}>
            {phoneBlurred
              ? 'Please enter a valid US/Canada phone number (e.g., +1 (555) 123-4567)'
              : 'Enter a valid US/Canada phone number'
            }
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-register" style={{ color: 'var(--heritage-green)' }}>Email</Label>
        <Input
          id="email-register"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-register" style={{ color: 'var(--heritage-green)' }}>Password</Label>
        <Input
          id="password-register"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" style={{ color: 'var(--heritage-green)' }}>Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          style={{ color: 'var(--text-gray)' }} className=""
        />
      </div>
      <Button type="submit" className="w-full" style={{ backgroundColor: 'var(--heritage-green)', color: 'white' }} disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 justify-center items-center" >
          <div id="google-signin-button-register" className="justify-center items-center flex w-full"></div>
        </div>
      </div>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--heritage-warm-bg)' }}>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <img src="/assets/images/logo-1.svg" alt="Heritage Budgeting" className="logo-image" />
            <span>Heritage Budgeting</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Hero text */}
            <div className="flex flex-col justify-center p-6 w-full">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--heritage-green)', fontFamily: 'var(--font-heading)' }}>
                {activeView === "login"
                  ? "Welcome back!"
                  : "Start your financial journey"
                }
              </h1>
              <p className="text-lg mb-6" style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-body)' }}>
                {activeView === "login"
                  ? "Sign in to your account to manage your finances and track your budget with ease."
                  : "Create an account to start tracking your expenses, setting budgets, and achieving your financial goals. Your data is encrypted and secure."
                }
              </p>

              {/* Benefits section instead of screenshot */}
              <div className="rounded-xl p-6 border shadow-md" style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--heritage-cream)' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--heritage-green)', fontFamily: 'var(--font-heading)' }}>
                  {activeView === "login"
                    ? "Your financial dashboard awaits"
                    : "Join thousands already saving money"
                  }
                </h3>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: 'var(--heritage-gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: 'var(--text-gray)' }}>Track expenses and income in one place</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: 'var(--heritage-gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: 'var(--text-gray)' }}>Create custom budgets for your spending</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: 'var(--heritage-gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: 'var(--text-gray)' }}>Visualize spending with beautiful charts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: 'var(--heritage-gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: 'var(--text-gray)' }}>Set and achieve your financial goals</span>
                  </li>
                </ul>

                {/* Trust indicator */}
                <div className="flex items-center border-t pt-4" style={{ borderColor: 'var(--heritage-cream)' }}>
                  <img
                    src="/assets/images/trusted-users.png"
                    alt="Trusted Users"
                    className="w-24 h-8 mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--heritage-green)' }}>Trusted by 30,000+ users worldwide</p>
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
            <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
              {/* Mobile tab switcher */}
              <div className="mb-6 flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--heritage-cream)' }}>
                <button
                  className="flex-1 py-3 px-4 text-center font-medium transition-colors"
                  style={activeView === 'login'
                    ? { backgroundColor: 'var(--heritage-green)', color: 'white' }
                    : { color: 'var(--text-gray)' }
                  }
                  onClick={() => setActiveView('login')}
                >
                  Sign In
                </button>
                <button
                  className="flex-1 py-3 px-4 text-center font-medium transition-colors"
                  style={activeView === 'register'
                    ? { backgroundColor: 'var(--heritage-green)', color: 'white' }
                    : { color: 'var(--text-gray)' }
                  }
                  onClick={() => setActiveView('register')}
                >
                  Create Account
                </button>
              </div>

              {/* Authentication forms */}
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--heritage-green)', fontFamily: 'var(--font-heading)' }}>
                  {activeView === 'login' ? 'Sign in to your account' : 'Create a new account'}
                </h2>
                <p className="mb-6" style={{ color: 'var(--text-gray)', fontFamily: 'var(--font-body)' }}>
                  {activeView === 'login'
                    ? 'Enter your credentials below'
                    : 'Fill in your information to get started'
                  }
                </p>

                {activeView === 'login' ? <LoginForm /> : <RegisterForm />}

                {/* Form switcher at bottom */}
                <div className="mt-6 text-center">
                  {activeView === 'login' ? (
                    <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setActiveView('register')}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--heritage-gold)' }}
                      >
                        Create one now
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
                      Already have an account?{' '}
                      <button
                        onClick={() => setActiveView('login')}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--heritage-gold)' }}
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