// Contract addresses and ABIs
// TODO: Replace with actual deployed contract addresses

export const CONTRACT_ADDRESSES = {
  // Replace with your deployed contract addresses
  PRODUCT_NFT: '0x...', // ProductNFT contract address
  BADGE_NFT: '0x...',   // BadgeNFT contract address
  FEEDBACK_MANAGER: '0x...', // FeedbackManager contract address
}

// Contract ABIs - these should match your deployed contracts
export const PRODUCT_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "product_owner", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "ipfs_cid", "type": "string"}
    ],
    "name": "mintProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "product_id", "type": "uint256"}],
    "name": "getProduct",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "product_id", "type": "uint256"},
          {"internalType": "address", "name": "product_owner", "type": "address"},
          {"internalType": "string", "name": "ipfs_cid", "type": "string"}
        ],
        "internalType": "struct ProductNFT.Product",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "product_count", "type": "uint256"},
      {"internalType": "uint256", "name": "start_index", "type": "uint256"}
    ],
    "name": "getAllProducts",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "product_id", "type": "uint256"},
          {"internalType": "address", "name": "product_owner", "type": "address"},
          {"internalType": "string", "name": "ipfs_cid", "type": "string"}
        ],
        "internalType": "struct ProductNFT.Product[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const BADGE_NFT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserTier",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "tier_id", "type": "uint256"},
      {"internalType": "string", "name": "ipfs_cid", "type": "string"}
    ],
    "name": "mintBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBadges",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const FEEDBACK_MANAGER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "string", "name": "feedbackHash", "type": "string"}
    ],
    "name": "submitFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "feedbackId", "type": "uint256"},
      {"internalType": "bool", "name": "isPositive", "type": "bool"}
    ],
    "name": "voteOnFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "feedbackId", "type": "uint256"}],
    "name": "getFeedback",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "feedbackId", "type": "uint256"},
          {"internalType": "address", "name": "feedbackBy", "type": "address"},
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "bool", "name": "approved", "type": "bool"},
          {"internalType": "string", "name": "feedbackHash", "type": "string"},
          {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
          {"internalType": "uint256", "name": "positiveVotes", "type": "uint256"},
          {"internalType": "uint256", "name": "negativeVotes", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct FeedbackManager.Feedback",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getProductFeedbacks",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserTier",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const
