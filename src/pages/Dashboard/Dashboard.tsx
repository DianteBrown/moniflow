// Update src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import BudgetLayout from "@/components/budget/BudgetLayout";
import ProfileCompletionModal from "@/components/auth/ProfileCompletionModal";

export default function Dashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    // Check if user needs to complete profile
    const pendingProfile = localStorage.getItem('pendingProfileCompletion');
    if (pendingProfile) {
      setShowProfileModal(true);
    }
  }, []);

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    localStorage.removeItem('pendingProfileCompletion');
    // Optionally refresh user data
    window.location.reload();
  };

  return (
    <>
      <BudgetLayout />
      <ProfileCompletionModal 
        isOpen={showProfileModal}
        onComplete={handleProfileComplete}
      />
    </>
  );
}