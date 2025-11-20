# Foundry Deployment Scripts

This directory contains Foundry scripts (.s.sol) for deploying and managing the Fiidbak contracts.

## Quick Start

```bash
# 1. Full deployment (all contracts)
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY

# 2. Verify setup is correct
forge script script/VerifySetup.s.sol:VerifySetupScript --rpc-url $RPC_URL

# 3. Get frontend config
forge script script/UpdateFrontendEnv.s.sol:UpdateFrontendEnvScript --rpc-url $RPC_URL
```

## Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| **Deploy.s.sol** | Deploy all 4 contracts + configure | First time deployment |
| **SetupVerification.s.sol** | Add verification to existing contracts | Upgrade existing deployment |
| **VerifySetup.s.sol** | Check all configs are correct | After any deployment |
| **TestVerification.s.sol** | Test the verification flow | Before deploying frontend |
| **UpdateFrontendEnv.s.sol** | Get frontend .env config | After deployment |

## Usage Examples

### Deploy Everything

```bash
# Set environment
export PRIVATE_KEY=0x...
export RPC_URL=https://base-sepolia.g.alchemy.com/v2/...

# Deploy with verification
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Add Verification to Existing Contracts

```bash
# If you already have ProductNFT and FeedbackManager
export PRODUCT_NFT_ADDRESS=0x...
export FEEDBACK_MANAGER_ADDRESS=0x...

forge script script/SetupVerification.s.sol:SetupVerificationScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verify Configuration

```bash
# Set all contract addresses
export USER_VERIFICATION_ADDRESS=0x...
export PRODUCT_NFT_ADDRESS=0x...
export BADGE_NFT_ADDRESS=0x...
export FEEDBACK_MANAGER_ADDRESS=0x...

# Run verification (no --broadcast needed, it's read-only)
forge script script/VerifySetup.s.sol:VerifySetupScript --rpc-url $RPC_URL
```

### Test Verification Flow

```bash
export USER_VERIFICATION_ADDRESS=0x...
export PRIVATE_KEY=0x...  # A test user's private key

forge script script/TestVerification.s.sol:TestVerificationScript \
  --rpc-url $RPC_URL \
  --broadcast
```

### Get Frontend Config

```bash
# After deployment, get the .env.local format
forge script script/UpdateFrontendEnv.s.sol:UpdateFrontendEnvScript \
  --rpc-url $RPC_URL
```

## Detailed Documentation

See **SCRIPTS_USAGE.md** in the parent directory for:
- Complete workflow examples
- Troubleshooting guide
- All script flags explained
- Network-specific instructions

## Script Descriptions

### 1. Deploy.s.sol
**Full deployment script**

Deploys:
- UserVerification
- ProductNFT
- BadgeNFT
- FeedbackManager

Then configures:
- Links UserVerification to ProductNFT
- Links UserVerification to FeedbackManager
- Links FeedbackManager to ProductNFT
- Grants MINTER_ROLE to FeedbackManager

### 2. SetupVerification.s.sol
**Add verification to existing deployment**

Use this if you already have ProductNFT and FeedbackManager deployed but want to add the verification system.

Requirements:
- Existing ProductNFT with `setUserVerification` function
- Existing FeedbackManager with `setUserVerification` function
- You must own both contracts

### 3. VerifySetup.s.sol
**Verify all configurations**

Read-only script that checks:
- All contracts are deployed
- All cross-contract references are set correctly
- Permissions are configured properly

### 4. TestVerification.s.sol
**Test the verification flow**

Simulates a complete user verification:
1. Generate nonce
2. Create message
3. Sign message
4. Submit to contract
5. Verify success

### 5. UpdateFrontendEnv.s.sol
**Output frontend configuration**

Displays the contract addresses in the format needed for your frontend `.env.local` file.

## Common Workflows

### New Project Setup

```bash
# 1. Deploy everything
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY

# 2. Save addresses to .env
echo "USER_VERIFICATION_ADDRESS=0x..." >> .env
echo "PRODUCT_NFT_ADDRESS=0x..." >> .env
# ... etc

# 3. Verify setup
source .env
forge script script/VerifySetup.s.sol:VerifySetupScript --rpc-url $RPC_URL

# 4. Update frontend
forge script script/UpdateFrontendEnv.s.sol:UpdateFrontendEnvScript --rpc-url $RPC_URL > ../fiidbak-app-frontend/.env.local
```

### Upgrade Existing Deployment

```bash
# Deploy only UserVerification and link it
export PRODUCT_NFT_ADDRESS=0x...
export FEEDBACK_MANAGER_ADDRESS=0x...

forge script script/SetupVerification.s.sol:SetupVerificationScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Verify After Changes

```bash
# Always verify after making changes
source .env
forge script script/VerifySetup.s.sol:VerifySetupScript --rpc-url $RPC_URL
```

## Tips

1. **Dry Run First**: Remove `--broadcast` to simulate without sending transactions
2. **Save Output**: Use `tee` to save deployment logs: `forge script ... | tee deployment.log`
3. **Verify Contracts**: Always use `--verify` flag when deploying to public networks
4. **Use .env**: Store all addresses in `.env` and `source .env` before running scripts
5. **Check Gas**: Add `--gas-estimate` to see gas costs before deploying

## Need Help?

- Read **SCRIPTS_USAGE.md** for complete guide
- Check **DEPLOYMENT_GUIDE.md** for deployment workflows
- Review script source code for implementation details
- Run with `-vvv` flag for verbose output

**Happy Deploying! 🚀**
