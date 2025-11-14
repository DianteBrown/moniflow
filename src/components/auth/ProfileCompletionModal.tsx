import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ProfileCompletionModal({ isOpen, onComplete }: ProfileCompletionModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);

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
    setPhoneNumber(formatted);
  };

  const handlePhoneBlur = () => {
    setPhoneBlurred(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid US/Canada phone number (e.g., +1 (555) 123-4567)');
      setIsLoading(false);
      return;
    }

    try {
      await authService.completeGoogleProfile({
        password,
        phone_number: phoneNumber
      });
      
      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      toast.error('Failed to complete profile');
      console.error('Profile completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          To access all features, please set up your password and phone number.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="dark:text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className="dark:text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                required
                placeholder="+1 (555) 123-4567"
                className={`dark:text-foreground ${phoneBlurred && phoneNumber && !validatePhoneNumber(phoneNumber)
                  ? 'border-red-500 focus:border-red-500'
                  : ''
                  }`}
              />
              {phoneBlurred && phoneNumber && !validatePhoneNumber(phoneNumber) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            {phoneBlurred && phoneNumber && !validatePhoneNumber(phoneNumber) && (
              <p className="text-sm text-red-500">Please enter a valid US/Canada phone number (e.g., +1 (555) 123-4567)</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            style={{backgroundColor: 'var(--heritage-green)'}}
            disabled={isLoading}
          >
            {isLoading ? 'Completing...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}