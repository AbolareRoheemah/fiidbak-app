'use client'

import { useVerification } from '@/hooks/useVerification';
import { VerificationModal } from './VerificationModal';
import { useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { Shield } from 'lucide-react';

interface VerificationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showButton?: boolean;
}

/**
 * Component that shows verification modal when user is not verified
 * Used to guard actions that require verification (create product, submit feedback)
 */
export function VerificationGuard({ children, fallback, showButton = true }: VerificationGuardProps) {
  const { address } = useAccount();
  const { isVerified, isCheckingVerification } = useVerification();
  const [showModal, setShowModal] = useState(false);

  // Not connected - show connect wallet message
  if (!address) {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Please connect your wallet to continue
        </p>
      </div>
    );
  }

  // Checking verification status
  if (isCheckingVerification) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking verification status...</p>
      </div>
    );
  }

  // Not verified - show verification prompt
  if (!isVerified) {
    return (
      <>
        {fallback || (
          <div className="text-center py-12">
            <Shield size={48} className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-6">
              You need to verify your wallet before you can {showButton ? 'continue' : 'use this feature'}
            </p>
            {showButton && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <Shield size={20} />
                Verify Wallet
              </button>
            )}
          </div>
        )}
        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Verified - render children
  return <>{children}</>;
}
