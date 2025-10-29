import { PRODUCT_NFT_ABI } from "@/lib/product_nft_abi";
import { BADGE_NFT_ABI } from "@/lib/badge_nft_abi";
import { FEEDBACK_MANAGER_ABI } from "@/lib/feedback_mg_abi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect } from "react";
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
      console.log('Create product error:', parseContractError(writeError || confirmError));
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

// Utility: Parse contract errors for user-friendly messages
function parseContractError(error: unknown): string {
  // console.log('Contract error details:', error);

  if (error instanceof BaseError) {
    const revertError = error.walk(error => error instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? '';
      return getErrorMessage(errorName) || (error as { shortMessage: string }).shortMessage;
    }
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('insufficient funds')) {
      return 'Insufficient funds for gas';
    }
    if (error.message.toLowerCase().includes('gas required exceeds allowance')) {
      return 'Transaction would fail - please check your inputs';
    }
    if (error.message.toLowerCase().includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
  }

  return 'An unexpected error occurred. Please check your inputs and try again.';
}

function getErrorMessage(errorType: string): string {
  const errorMessages: Record<string, string> = {
    OwnableUnauthorizedAccount: "Only the owner can call this function",
    // Add more custom error mappings as needed
  };
  return errorMessages[errorType] || "";
}