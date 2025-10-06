import { PRODUCT_NFT_ABI } from "@/lib/product_nft_abi";
import { BADGE_NFT_ABI } from "@/lib/badge_nft_abi";
import { FEEDBACK_MANAGER_ABI } from "@/lib/feedback_mg_abi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect } from "react";
import { simulateContract } from '@wagmi/core';
import { config } from "@/app/wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

export function getAllProducts() {
  return useReadContract({
    abi: PRODUCT_NFT_ABI,
    address: CONTRACT_ADDRESSES.PRODUCT_NFT,
    functionName: "getAllProducts",
    args: [10, 0],
  })
}