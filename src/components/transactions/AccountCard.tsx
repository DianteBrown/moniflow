import { CreditCard, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { PlaidAccountInfo } from "@/services/plaidService";

interface AccountCardProps {
  account: PlaidAccountInfo;
}

const AccountCard = ({ account }: AccountCardProps) => {
  const formatBalance = (balance: number | null) => {
    if (balance === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const getAccountIcon = (type: string, subtype: string) => {
    if (type === 'credit' || subtype === 'credit card') {
      return <CreditCard className="h-5 w-5" style={{color: 'var(--heritage-gold)'}} />;
    }
    return <DollarSign className="h-5 w-5" style={{color: 'var(--heritage-green)'}} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getAccountIcon(account.type, account.subtype)}
          <div>
            <h4 className="font-medium">{account.name}</h4>
            <p className="text-sm text-muted-foreground">
              {account.official_name || account.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {account.type} • {account.subtype} • ****{account.mask}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {formatBalance(account.balance_current)}
          </p>
          {account.balance_available !== null && account.balance_available !== account.balance_current && (
            <p className="text-sm text-muted-foreground">
              Available: {formatBalance(account.balance_available)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AccountCard;
