import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Unlink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectedBank } from "@/services/plaidService";
import AccountCard from "./AccountCard";

// Simple inline Badge component
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

interface BankCardProps {
  bank: ConnectedBank;
  onDisconnect: (bankId: string) => void;
  onRemove: (bankId: string) => void;
  onReconnect: (bankId: string) => void;
}

const BankCard = ({ bank, onDisconnect, onRemove, onReconnect }: BankCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // ✅ Add focus management for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Cleanup effect to reset dialog state
  useEffect(() => {
    if (!showRemoveDialog) {
      setIsRemoving(false);
      setDropdownOpen(false);
    }
  }, [showRemoveDialog]);

  // Additional cleanup effect to ensure state is reset on unmount
  useEffect(() => {
    return () => {
      setIsRemoving(false);
      setDropdownOpen(false);
    };
  }, []);
  // ✅ Handle dropdown state changes
  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    // If dropdown is closing, ensure focus is properly managed
    if (!open) {
      // Small delay to ensure focus is properly reset
      setTimeout(() => {
        // Focus management is handled by the dropdown component
      }, 50);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'removed':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'disconnected':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'removed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{bank.institution_name}</h3>
            <p className="text-sm text-muted-foreground">
              Connected {new Date(bank.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(bank.status)}>
            {getStatusIcon(bank.status)}
            <span className="ml-1 capitalize">{bank.status}</span>
          </Badge>

          {/* ✅ Action menu with proper focus management */}
          <DropdownMenu onOpenChange={handleDropdownOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {bank.status === 'disconnected' || bank.status === 'removed' ? (
                <DropdownMenuItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onReconnect(bank.id);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reconnect
                </DropdownMenuItem>
              ) : bank.status === 'active' ? (
                <DropdownMenuItem
                  onClick={() => {
                    setDropdownOpen(false);
                    onDisconnect(bank.id);
                  }}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              ) : null}

              {(bank.status === 'disconnected' || bank.status === 'active') && (
                <DropdownMenuItem
                  onClick={() => {
                    setDropdownOpen(false);
                    // Small delay to ensure dropdown closes before opening dialog
                    setTimeout(() => {
                      setShowRemoveDialog(true);
                    }, 100);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Bank
                </DropdownMenuItem>
              )}

            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand bank details' : 'Collapse bank details'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {bank.error_message && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {bank.error_message}
                </AlertDescription>
              </Alert>
            )}

            {bank.plaid_accounts && bank.plaid_accounts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Accounts</h4>
                <div className="space-y-2">
                  {bank.plaid_accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </div>
            )}

            {bank.last_successful_update && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(bank.last_successful_update).toLocaleString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove confirmation dialog */}
      <Dialog
        key={bank.id}
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Bank Connection</DialogTitle>
            <DialogDescription>
              This will <strong>permanently delete</strong> {bank.institution_name} and ALL associated data.
              All accounts and transaction history will be permanently removed and cannot be recovered.
              This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setIsRemoving(true);
                try {
                  // Add a timeout wrapper to prevent infinite hanging
                  const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Operation timeout')), 35000)
                  );

                  await Promise.race([
                    onRemove(bank.id),
                    timeoutPromise
                  ]);
                  // Success: close dialog and reset state
                  setShowRemoveDialog(false);
                  setIsRemoving(false);
                  setDropdownOpen(false);
                } catch (error) {
                  console.error('Remove operation failed:', error);
                  // Error: reset loading state but keep dialog open to show error
                  setIsRemoving(false);
                }
              }}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Bank'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BankCard;
