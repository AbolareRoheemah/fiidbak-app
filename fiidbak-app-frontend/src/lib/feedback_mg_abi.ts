export const FEEDBACK_MANAGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "defaultAdmin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_badgeContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_productNFTContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "badgeContract",
        "type": "address"
      }
    ],
    "name": "BadgeContractSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "FeedbackApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "feedbackHash",
        "type": "string"
      }
    ],
    "name": "FeedbackSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isPositive",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      }
    ],
    "name": "FeedbackVoted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "productNFTContract",
        "type": "address"
      }
    ],
    "name": "ProductNFTContractSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "APPROVER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BRONZE_VOTE_WEIGHT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GOLD_VOTE_WEIGHT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SILVER_VOTE_WEIGHT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "THRESHOLD",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VOTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WOOD_VOTE_WEIGHT",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      }
    ],
    "name": "approveFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "badgeContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "ipfsCid",
        "type": "string"
      }
    ],
    "name": "claimBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "feedbackVotes",
    "outputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isPositive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "feedbacks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feedbackBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "feedbackHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "positiveVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "negativeVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getEligibleBadges",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      }
    ],
    "name": "getFeedback",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "feedbackId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "feedbackBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "feedbackHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "positiveVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "negativeVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      }
    ],
    "name": "getFeedbackVotes",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "voter",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isPositive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "weight",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct FeedbackManager.Vote[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "startIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "name": "getFeedbacksByRange",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "feedbackId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "feedbackBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "feedbackHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "totalVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "positiveVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "negativeVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct FeedbackManager.Feedback[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      }
    ],
    "name": "getProductFeedbackCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      }
    ],
    "name": "getProductFeedbacks",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalFeedbacks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserTier",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tier",
        "type": "uint256"
      }
    ],
    "name": "getVoteWeight",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "grantApprover",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "productFeedbacks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "productNFTContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "revokeApprover",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_badgeContract",
        "type": "address"
      }
    ],
    "name": "setBadgeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_productNFTContract",
        "type": "address"
      }
    ],
    "name": "setProductNFTContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "feedbackHash",
        "type": "string"
      }
    ],
    "name": "submitFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userApprovedFeedbackCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "feedbackId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isPositive",
        "type": "bool"
      }
    ],
    "name": "voteOnFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;