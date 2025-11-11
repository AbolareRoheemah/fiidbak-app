import { useContract as useWagmiContract } from 'wagmi'
import { CONTRACT_ADDRESSES, PRODUCT_NFT_ABI, BADGE_NFT_ABI, FEEDBACK_MANAGER_ABI } from '../lib/contracts'

export function useProductContract() {
  return useWagmiContract({
    address: CONTRACT_ADDRESSES.PRODUCT_NFT,
    abi: PRODUCT_NFT_ABI,
  })
}

export function useBadgeContract() {
  return useWagmiContract({
    address: CONTRACT_ADDRESSES.BADGE_NFT,
    abi: BADGE_NFT_ABI,
  })
}

export function useFeedbackContract() {
  return useWagmiContract({
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    abi: FEEDBACK_MANAGER_ABI,
  })
}
