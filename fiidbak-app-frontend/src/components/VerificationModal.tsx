'use client'

import { useVerification } from '@/hooks/useVerification';
import { Shield, CheckCircle, Loader2, X } from 'lucide-react';
import { useEffect } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function VerificationModal({ isOpen, onClose, onVerified }: VerificationModalProps) {
  const { isVerified, isVerifying, verifyWallet } = useVerification();

  // Auto-close and trigger callback when verified
  useEffect(() => {
    if (isVerified && isOpen) {
      setTimeout(() => {
        onClose();
        onVerified?.();
      }, 1500);
    }
  }, [isVerified, isOpen, onClose, onVerified]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          disabled={isVerifying}
        >
          <X size={20} />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            {isVerified ? (
              <CheckCircle size={32} className="text-green-500" />
            ) : (
              <Shield size={32} className="text-primary" />
            )}
          </div>

          {/* Content */}
          {isVerified ? (
            <>
              <h2 className="text-2xl font-bold mb-2">Wallet Verified!</h2>
              <p className="text-muted-foreground mb-6">
                You can now create products and submit feedback
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Verify Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Sign a message to prove you own this wallet. This is free and doesn't cost any gas.
              </p>

              {/* What happens section */}
              <div className="bg-secondary/30 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">What happens next:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">1.</span>
                    <span>You'll sign a message in your wallet (free, no gas)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">2.</span>
                    <span>Your wallet will be verified on-chain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 text-primary">3.</span>
                    <span>You can create products and submit feedback</span>
                  </li>
                </ol>
              </div>

              {/* Verify button */}
              <button
                onClick={verifyWallet}
                disabled={isVerifying}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Verify Wallet
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground mt-4">
                This verification is required to prevent spam and ensure authentic reviews
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
