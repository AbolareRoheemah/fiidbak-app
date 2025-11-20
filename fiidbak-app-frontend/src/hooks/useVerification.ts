import { useCallback, useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { toast } from 'react-hot-toast';
import { keccak256, toBytes, encodePacked } from 'viem';

const USER_VERIFICATION_ABI = [
  {
    inputs: [
      { name: 'nonce', type: 'bytes32' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'verify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'isVerified',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'nonce', type: 'bytes32' }],
    name: 'usedNonces',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'UserVerified',
    type: 'event'
  }
] as const;

export function useVerification() {
  const { address } = useAccount();
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if user is verified
  const {
    data: isVerified,
    isLoading: isCheckingVerification,
    refetch: refetchVerification
  } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_VERIFICATION as `0x${string}`,
    abi: USER_VERIFICATION_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Sign message hook
  const { signMessageAsync } = useSignMessage();

  // Write contract hook
  const {
    data: hash,
    writeContract,
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Verify wallet function
  const verifyWallet = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsVerifying(true);

    try {
      // Generate a unique nonce
      const nonce = keccak256(toBytes(`${address}-${Date.now()}`));

      // Create the message to sign - must match contract's abi.encodePacked format
      // Contract does: keccak256(abi.encodePacked("I want to verify my wallet", msg.sender, nonce))
      const messageBytes = encodePacked(
        ['string', 'address', 'bytes32'],
        ['I want to verify my wallet', address, nonce]
      );
      const messageHash = keccak256(messageBytes);

      // Sign the message hash
      toast.loading('Please sign the message in your wallet...', { id: 'signing' });
      const signature = await signMessageAsync({
        message: { raw: messageHash },
      });
      toast.dismiss('signing');

      // Submit to contract
      toast.loading('Verifying on-chain...', { id: 'verifying' });
      writeContract({
        address: CONTRACT_ADDRESSES.USER_VERIFICATION as `0x${string}`,
        abi: USER_VERIFICATION_ABI,
        functionName: 'verify',
        args: [nonce, signature as `0x${string}`],
      });

    } catch (error: unknown) {
      console.error('Verification error:', error);
      toast.dismiss('signing');
      toast.dismiss('verifying');

      if (error instanceof Error && error.message?.includes('User rejected')) {
        toast.error('Signature rejected');
      } else {
        toast.error('Verification failed. Please try again.');
      }
      setIsVerifying(false);
    }
  }, [address, signMessageAsync, writeContract]);

  // Handle verification success
  useEffect(() => {
    if (isConfirmed) {
      toast.dismiss('verifying');
      toast.success('Wallet verified successfully!');
      setIsVerifying(false);
      refetchVerification();
    }
  }, [isConfirmed, refetchVerification]);

  // Handle verification error
  useEffect(() => {
    if (writeError) {
      toast.dismiss('verifying');
      toast.error('Verification failed. Please try again.');
      console.error('Write error:', writeError);
      setIsVerifying(false);
    }
  }, [writeError]);

  return {
    isVerified: Boolean(isVerified),
    isCheckingVerification,
    isVerifying: isVerifying || isWritePending || isConfirming,
    verifyWallet,
    refetchVerification,
  };
}
