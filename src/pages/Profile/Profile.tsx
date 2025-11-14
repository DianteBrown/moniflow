// Updated src/pages/Profile/Profile.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone_number: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [phoneBlurred, setPhoneBlurred] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setName(userData.name);
      setPhoneNumber(userData.phone_number || '');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone number
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid US/Canada phone number (e.g., +1 (555) 123-4567)');
      setIsLoading(false);
      return;
    }

    try {
      await authService.updateProfile({
        name,
        phone_number: phoneNumber
      });

      toast.success('Profile updated successfully!');
      await loadUserProfile();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      setIsChangingPassword(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword,
        newPassword
      });

      toast.success('Password changed successfully!');
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="dark:text-foreground"
            />
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Phone Number
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
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

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#00A626] hover:bg-[#00A626]/90 text-white border-none px-5 py-2.5 rounded-md scale-110 font-medium"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
        <div className="flex items-center mb-6">
          <div className="bg-red-500/10 p-3 rounded-full mr-4">
            <Lock className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-gray-600 dark:text-gray-400">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="current-password" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                className="dark:text-foreground pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
                className="dark:text-foreground pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Password must be at least 6 characters long</p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
                className="dark:text-foreground pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#FF0000] hover:bg-[#EE0000]/90 text-white border-none px-5 py-2.5 rounded-md scale-110 font-medium"
              disabled={isChangingPassword}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}