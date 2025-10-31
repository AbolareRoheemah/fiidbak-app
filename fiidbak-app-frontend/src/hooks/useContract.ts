import { PRODUCT_NFT_ABI } from "@/lib/product_nft_abi";
import { BADGE_NFT_ABI } from "@/lib/badge_nft_abi";
import { FEEDBACK_MANAGER_ABI } from "@/lib/feedback_mg_abi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect, useState } from "react";
import { simulateContract } from '@wagmi/core';
import { config } from "@/app/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { toast } from 'react-hot-toast';
import { BaseError, ContractFunctionRevertedError } from "viem";

// Custom error types
export enum ContractError {
  CoolDownTimeTooSmall = 'Cooldown time cannot be set to less than 30sec',
  TokenLimitExceeded = 'You cant get more than 10WAG tokens at a time'
}

// ---------- Product ----------

// Read: Get all products
export function getAllProducts(args: [number, number] = [10, 0]) {
  return useReadContract({
    abi: PRODUCT_NFT_ABI,
    address: CONTRACT_ADDRESSES.PRODUCT_NFT,
    functionName: "getAllProducts",
    args,
  });
}

// Write: Create a new product (mintProduct)
// Accepts an optional onSuccess callback for navigation or other side effects
export function useCreateProduct(onSuccess?: () => void) {
  const { data: writeData, writeContract, error: writeError, isPending: isCreateLoading } = useWriteContract();
  const { 
    isSuccess: isCreateSuccess,
    error: confirmError
  } = useWaitForTransactionReceipt({ 
    hash: writeData 
  });

  // product_owner: address, amount: uint256, ipfs_cid: string
  const createProduct = useCallback(async (
    productOwner: `0x${string}`,
    amount: number | bigint,
    ipfsCid: string
  ) => {
    try {
      // Simulate the transaction first
      await simulateContract(config, {
        abi: PRODUCT_NFT_ABI,
        address: CONTRACT_ADDRESSES.PRODUCT_NFT,
        functionName: 'mintProduct',
        args: [productOwner, BigInt(amount), ipfsCid],
      });

      // If simulation succeeds, execute the transaction
      writeContract({
        abi: PRODUCT_NFT_ABI,
        address: CONTRACT_ADDRESSES.PRODUCT_NFT,
        functionName: 'mintProduct',
        args: [productOwner, BigInt(amount), ipfsCid],
      });
    } catch (error) {
      const errorMessage = parseContractError(error);
      toast.error(errorMessage);
    }
  }, [writeContract]);

  useEffect(() => {
    if (isCreateSuccess) {
      toast.success("Product created successfully!");
      if (onSuccess) {
        onSuccess();
      }
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
      console.log("Create product error:", parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isCreateSuccess, onSuccess]);

  return {
    createProduct,
    isCreateLoading,
    isCreateSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

// ---------- Feedback (READ/WRITE HOOKS) ----------

// Read: Fetch all feedback ids for a product
export function useProductFeedbackIds(productId?: number | bigint) {
  // If no productId, skip query
  return useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: "getProductFeedbacks",
    args: typeof productId === "undefined" ? undefined : [productId],
    query: {
      enabled: typeof productId !== "undefined",
    },
  });
}

// Read: Fetch a feedback by feedbackId
export function useFeedback(feedbackId?: number | bigint) {
  return useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: "getFeedback",
    args: typeof feedbackId === "undefined" ? undefined : [feedbackId],
    query: {
      enabled: typeof feedbackId !== "undefined",
    },
  });
}

// Write: Submit Feedback to contract
export function useWriteFeedback(onSuccess?: () => void) {
  const {
    data: writeData,
    writeContract,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isFeedbackSuccess,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Track if we've already shown success toast to prevent duplicates
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  // submitFeedback(productId, feedbackHash)
  const giveFeedback = useCallback(
    async (productId: number | bigint, feedbackHash: string) => {
      try {
        // Reset success flag
        setHasShownSuccess(false);

        // Simulate transaction first
        await simulateContract(config, {
          abi: FEEDBACK_MANAGER_ABI,
          address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
          functionName: "submitFeedback",
          args: [BigInt(productId), feedbackHash],
        });

        writeContract({
          abi: FEEDBACK_MANAGER_ABI,
          address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
          functionName: "submitFeedback",
          args: [BigInt(productId), feedbackHash],
        });
      } catch (error) {
        const errorMessage = parseContractError(error);
        toast.error(errorMessage);
      }
    },
    [writeContract]
  );

  useEffect(() => {
    if (isFeedbackSuccess && !hasShownSuccess) {
      setHasShownSuccess(true);
      toast.success("Feedback submitted successfully!");
      if (onSuccess) {
        onSuccess();
      }
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
      console.log("Submit feedback error:", parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isFeedbackSuccess, hasShownSuccess, onSuccess]);

  // Loading is true when either writing or confirming
  const isFeedbackLoading = isWritePending || isConfirming;

  return {
    giveFeedback,
    isFeedbackLoading,
    isFeedbackSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

// Read: Fetch multiple feedbacks in a range [startIndex, count] (all feedbacks)
export function useAllFeedbacksByRange(
  startIndex: number | bigint = 0,
  count: number | bigint = 20
) {
  return useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: "getFeedbacksByRange",
    args: [BigInt(startIndex), BigInt(count)],
  });
}

// Utility: Parse contract errors for user-friendly messages
function parseContractError(error: unknown): string {
  // console.log('Contract error details:', error);

  if (error instanceof BaseError) {
    const revertError = error.walk((error) => error instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
      return getErrorMessage(errorName) || (error as { shortMessage: string }).shortMessage;
    }
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("insufficient funds")) {
      return "Insufficient funds for gas";
    }
    if (error.message.toLowerCase().includes("gas required exceeds allowance")) {
      return "Transaction would fail - please check your inputs";
    }
    if (error.message.toLowerCase().includes("user rejected")) {
      return "Transaction was rejected by user";
    }
  }

  return "An unexpected error occurred. Please check your inputs and try again.";
}

function getErrorMessage(errorType: string): string {
  const errorMessages: Record<string, string> = {
    OwnableUnauthorizedAccount: "Only the owner can call this function",
    // Add more custom error mappings as needed
  };
  return errorMessages[errorType] || "";
}

// ---------- Voting ----------

// Write: Vote on feedback
export function useVoteFeedback(onSuccess?: () => void) {
  const {
    data: writeData,
    writeContract,
    error: writeError,
    isPending: isVoteLoading,
  } = useWriteContract();
  const { isSuccess: isVoteSuccess, error: confirmError } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // voteOnFeedback(feedbackId, isPositive)
  const voteOnFeedback = useCallback(
    async (feedbackId: number | bigint, isPositive: boolean) => {
      try {
        // Simulate transaction first
        await simulateContract(config, {
          abi: FEEDBACK_MANAGER_ABI,
          address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
          functionName: "voteOnFeedback",
          args: [BigInt(feedbackId), isPositive],
        });

        writeContract({
          abi: FEEDBACK_MANAGER_ABI,
          address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
          functionName: "voteOnFeedback",
          args: [BigInt(feedbackId), isPositive],
        });
      } catch (error) {
        const errorMessage = parseContractError(error);
        toast.error(errorMessage);
      }
    },
    [writeContract]
  );

  useEffect(() => {
    if (isVoteSuccess) {
      toast.success("Vote submitted successfully!");
      if (onSuccess) {
        onSuccess();
      }
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
      console.log("Vote error:", parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isVoteSuccess, onSuccess]);

  return {
    voteOnFeedback,
    isVoteLoading,
    isVoteSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

// Read: Check if user has voted on a feedback
export function useHasVoted(feedbackId?: number | bigint, userAddress?: `0x${string}`) {
  return useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: "hasVoted",
    args: typeof feedbackId === "undefined" || !userAddress ? undefined : [feedbackId, userAddress],
    query: {
      enabled: typeof feedbackId !== "undefined" && !!userAddress,
    },
  });
}

// ---------- Badge ----------

// Read: Get user's badge tier
export function useUserTier(userAddress?: `0x${string}`) {
  return useReadContract({
    abi: BADGE_NFT_ABI,
    address: CONTRACT_ADDRESSES.BADGE_NFT,
    functionName: "getUserTier",
    args: !userAddress ? undefined : [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
}

// Read: Get user's badges
export function useUserBadges(userAddress?: `0x${string}`) {
  return useReadContract({
    abi: BADGE_NFT_ABI,
    address: CONTRACT_ADDRESSES.BADGE_NFT,
    functionName: "getUserBadges",
    args: !userAddress ? undefined : [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
}