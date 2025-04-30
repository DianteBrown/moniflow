import { Link } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';

const SubscriptionBadge = () => {
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse mr-2"></div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const getBadgeColors = () => {
    if (isPremium) {
      return 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700';
    }
    return 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700';
  };

  return (
    <div className="flex items-center">
      <Link to="/subscription/manage" title="Manage Subscription">
        <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getBadgeColors()} mr-2 cursor-pointer transition-colors`}>
          {isPremium ? 'Premium' : 'Free'}
        </div>
      </Link>
    </div>
  );
};

export default SubscriptionBadge; 