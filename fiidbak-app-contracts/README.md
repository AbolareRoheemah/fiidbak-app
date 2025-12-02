# Fiidbak — Onchain Product Feedback & Reputation Badges

**Fiidbak** is a fully decentralized, identity-verified product feedback platform built on **Base Sepolia**.

Users submit real feedback about real-world products. The community votes — with vote weight determined by proven reputation. Helpful contributors earn **soulbound reputation badges** that permanently boost their influence.

Your feedback lives forever on-chain. Your reputation grows with it.

### Live Demo
**https://fiidbak-app.vercel.app/**

### Demo Video
[![Fiidbak Demo Video](https://www.loom.com/share/5d2107bdb1034ff88df49016f49df9cd)](https://www.loom.com/share/5d2107bdb1034ff88df49016f49df9cd)  

---

## Core Features

| Feature                        | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Sybil-Resistant Verification** | Users must sign a message to prove wallet ownership — **no bots allowed** |
| **Onchain Feedback**          | Feedback stored via IPFS hash + onchain metadata (immutable & public)     |
| **Reputation-Weighted Voting**| Vote power scales with your badge tier: Wood=1× → Gold=5×                 |
| **Auto + Manual Approval**    | Feedback auto-approves at ≥10 positive vote weight                         |
| **Soulbound Reputation Badges**| Non-transferable NFTs that level up with helpful contributions           |

### Anti-Sybil: Wallet Ownership Verification

Fiidbak uses an onchain **UserVerification** contract to ensure every participant is a real person with one wallet.

**How it works:**
1. User connects wallet
2. Frontend generates a unique nonce + message:  
   `"I want to verify my wallet" + address + nonce`
3. User signs the message with their wallet
4. Transaction calls `UserVerification.verify(nonce, signature)`
5. Contract recovers signer → confirms it matches `msg.sender`
6. User is marked as `isVerified[address] = true` forever
7. Nonce is burned → prevents replay attacks

---

### Reputation Badge Tiers

| Tier     | Approved Feedback Needed | Vote Weight | Badge Type     |
|---------|--------------------------|-------------|----------------|
| Seedling| 1+                       | 0×          | Entry          |
| Wood    | 5+                       | 1×          | Basic Voter    |
| Bronze  | 10+                      | 2×          | Trusted        |
| Silver  | 15+                      | 3×          | Veteran        |
| Gold    | 20+                      | 5×          | Top Contributor|

Badges are **soulbound (non-transferable)** — your reputation is truly yours.

---

## Tech Stack

### Smart Contracts (Solidity)
- **Network**: Base Sepolia
- **Key Contracts**:
  - `UserVerification.sol` – Anti-sybil signature verification (ECDSA + nonce)
  - `ProductNFT.sol` – Registers real-world products
  - `BadgeNFT.sol` – Soulbound reputation badges (ERC721)
  - `FeedbackManager.sol` – Core logic
- **Standards**: ERC721, OpenZeppelin v5
- **Deployment**: Foundry

### Frontend
- Next.js 14 (App Router)
- wagmi + viem + RainbowKit
- Tailwind CSS + Shadcn/ui
- IPFS via nft.storage

---

## Deployed Contracts (Base Sepolia)

| Contract              | Address                                      | Verified |
|-----------------------|----------------------------------------------|----------|
| UserVerification      | `0x497B8c8EC863367c331a730BdDd905e2f451Ac7b`                  | Yes   |
| ProductNFT            | `0x74d9e4C92413e4e9A98E894248c6a279A88A94d7` | Yes   |
| BadgeNFT              | `0xb80Bf8568f96869C819c4208E1bcA1739F03CBe5` | Yes   |
| FeedbackManager | `0x329f4881a28D2053d28b6A82A93E7c44b6a7167D` | Yes   |

---

## Quick Start (Developers)

```bash
# Clone repo
git clone https://github.com/yourusername/fiidbak.git
cd fiidbak-app-contracts

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```
