// Addresses for deployed contracts loaded from environment variables
export const CONTRACT_ADDRESSES = {
  PRODUCT_NFT: process.env.NEXT_PUBLIC_PRODUCT_NFT_ADDRESS as `0x${string}`,
  BADGE_NFT: process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS as `0x${string}`,
  FEEDBACK_MANAGER: process.env.NEXT_PUBLIC_FEEDBACK_MANAGER_ADDRESS as `0x${string}`,
}

// Log addresses for debugging
if (typeof window !== 'undefined') {
  console.log('📝 Contract Addresses:', CONTRACT_ADDRESSES)
}
