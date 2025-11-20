# Fiidbak App - Demo Plan

## Overview
Fiidbak is a blockchain-based product feedback platform where reviews are permanently stored on-chain, preventing manipulation or deletion. This demo plan will guide you through showcasing all key features.

---

## Pre-Demo Checklist

### 1. Environment Setup
- [ ] Ensure contracts are deployed and addresses are correctly set in frontend
- [ ] Frontend dev server is running (`npm run dev` in fiidbak-app-frontend)
- [ ] Have 2-3 wallet addresses ready:
  - **Wallet 1**: Admin/Approver wallet (with approver role)
  - **Wallet 2**: Regular user wallet (for creating products)
  - **Wallet 3**: Another regular user (for submitting feedback)

### 2. Test Data Preparation
- [ ] Have 1-2 products already created (optional but recommended)
- [ ] Have product images/details ready for demo creation:
  - Product name
  - Description
  - Image URL or file
- [ ] Have sample feedback text ready

### 3. Browser Setup
- [ ] Open browser with wallet extension (MetaMask, etc.)
- [ ] Clear cache if needed to show fresh experience
- [ ] Have block explorer open in another tab (for showing on-chain transactions)

---

## Demo Flow (15-20 minutes)

### Part 1: Platform Introduction (3-4 minutes)

**Start on Home Page**

#### Key Points to Highlight:
1. **The Problem**: Traditional review platforms can delete, hide, or manipulate feedback
2. **The Solution**: Blockchain-verified, permanent, tamper-proof reviews
3. **Key Features**:
   - Blockchain Verified - reviews can't be deleted or manipulated
   - Earn Reputation - quality reviewers earn badges
   - NFT Proof - each review is an NFT you own

#### Demo Steps:
```
1. Land on home page (/)
2. Scroll through hero section
3. Point out the "Why Fiidbak?" features section
4. Show "Recently Added Products" section (if products exist)
5. Click "Browse Products" to transition to next section
```

**Script**:
> "Welcome to Fiidbak - a decentralized product feedback platform. Unlike traditional review sites, every review here is stored permanently on the blockchain, making it impossible for anyone - including us - to delete or manipulate feedback. This ensures complete transparency and trust."

---

### Part 2: Exploring Products (2-3 minutes)

**Navigate to Products Page**

#### Demo Steps:
```
1. Show all products listed
2. Explain the product cards (name, description, feedback count)
3. Click on a product to view details
```

**Script**:
> "Here we can see all products listed on the platform. Each product has its metadata stored on IPFS and referenced on-chain. Let's click on one to see its details."

---

### Part 3: Product Details & Feedback (3-4 minutes)

**On Product Details Page**

#### Demo Steps:
```
1. Show product information
2. Scroll to feedbacks section
3. Point out:
   - Feedback content (stored as IPFS hash on-chain)
   - Reviewer address
   - Timestamp
   - Approval status (approved feedbacks are visible)
```

**Script**:
> "This is the product detail page. You can see all the information about the product and scroll down to see feedback. Each feedback is stored on the blockchain with the reviewer's wallet address and timestamp, ensuring authenticity."

---

### Part 4: Wallet Verification Flow (4-5 minutes)

**Creating a Product (Requires Verification)**

#### Demo Steps:
```
1. Connect wallet (if not already connected)
2. Click "Create Product" or navigate to /create-product
3. Verification modal should appear
4. Walk through verification process:

   Step 1: Modal shows up explaining verification
   → Click "Verify Wallet"

   Step 2: Wallet prompts for off-chain signature
   → Sign the message (free, no gas)
   → Explain: "This proves you own the wallet"

   Step 3: Transaction sent to blockchain
   → Sign the transaction
   → Wait for confirmation
   → Explain: "Now recording verification on-chain"

   Step 4: Success!
   → Modal shows success message
   → Auto-closes after 1.5 seconds
```

**Script**:
> "Before creating products or submitting feedback, users must verify their wallet. This is a one-time process. First, you sign a message to prove ownership - this is free and doesn't cost gas. Then we record this verification on-chain. This prevents spam and ensures all feedback comes from verified wallets."

**Important Notes**:
- Show the wallet signature popup
- Point out it's a two-step process (off-chain signature + on-chain transaction)
- Emphasize this is one-time only

---

### Part 5: Creating a Product (3-4 minutes)

**After Verification is Complete**

#### Demo Steps:
```
1. Fill out product form:
   - Product Name: "Amazing Headphones Pro"
   - Description: "Wireless headphones with noise cancellation"
   - Image: Upload or paste URL

2. Click "Create Product"

3. Show transaction flow:
   → Uploading to IPFS (metadata stored)
   → Wallet prompts for transaction
   → Sign transaction
   → Show loading state
   → Success confirmation

4. Redirect to products page
5. Show newly created product
```

**Script**:
> "Once verified, creating a product is simple. We fill in the product details, and when we submit, the data is first uploaded to IPFS for decentralized storage. Then we record the product on-chain with a reference to this IPFS data. Let's create one now..."

**Key Points**:
- Highlight the IPFS upload step
- Show the transaction in wallet
- Point out gas cost
- Show success message

---

### Part 6: Submitting Feedback (3-4 minutes)

**Switch to Different Wallet (Wallet 3)**

#### Demo Steps:
```
1. Disconnect current wallet
2. Connect with different wallet
3. If not verified, go through verification (or skip if time-constrained)
4. Navigate to a product
5. Submit feedback:

   Step 1: Write feedback text
   → "These headphones have amazing sound quality and battery life!"

   Step 2: Click "Submit Feedback"
   → Feedback uploaded to IPFS
   → Transaction confirmation
   → Sign transaction

   Step 3: Show feedback in "Pending" state
   → Explain it needs admin approval
```

**Script**:
> "Anyone with a verified wallet can submit feedback. Let's switch to a different wallet and submit a review. The feedback is stored on IPFS and referenced on-chain. Notice that new feedback starts in a 'pending' state - it requires admin approval before it's publicly visible. This helps maintain quality and prevent spam."

---

### Part 7: Admin Dashboard & Moderation (4-5 minutes)

**Switch to Admin Wallet (Wallet 1)**

#### Demo Steps:
```
1. Connect with admin wallet (one with approver role)
2. Navigate to /admin-dashboard
3. Show dashboard features:

   Statistics Section:
   → Total Products
   → Total Feedback
   → Pending Approvals
   → Approved Count

   Moderation Section:
   → Show "Pending Approvals" tab
   → Display pending feedback
   → Show feedback details (content, author, product, date)

4. Approve a feedback:
   → Click "Approve" button
   → Sign transaction
   → Show feedback moving to "Approved" tab
   → Refresh product page to show approved feedback

5. Show "Approved Feedback" tab
```

**Script**:
> "The admin dashboard is only accessible to wallets with the approver role. Here, moderators can review pending feedback and approve legitimate reviews. This moderation layer ensures quality while maintaining the blockchain's immutability - once approved, feedback cannot be deleted. Let's approve the feedback we just submitted..."

**Key Points**:
- Emphasize role-based access control
- Show on-chain transaction for approval
- Explain that approval is permanent (can't un-approve)
- Show stats updating in real-time

---

## Additional Features to Mention

### Profile Page
- Shows user's created products
- Shows feedback they've submitted
- Wallet verification status

### Blockchain Benefits
- **Immutability**: Once on-chain, data can't be altered
- **Transparency**: All transactions visible on block explorer
- **Decentralization**: Data stored on IPFS (not centralized server)
- **Ownership**: Users own their reviews (NFTs)

---

## Q&A Preparation

### Expected Questions:

**Q: What blockchain is this on?**
A: Currently deployed on [Your Network Name]. We chose this because [reasons - low gas fees, good dev tools, etc.]

**Q: What prevents spam reviews?**
A: Three layers: 1) Wallet verification requirement, 2) On-chain storage cost, 3) Admin moderation before approval

**Q: Can reviews be deleted?**
A: No. Once approved and on-chain, reviews are permanent. Even admins cannot delete them.

**Q: How much does it cost to submit feedback?**
A: It costs the gas fee for the transaction (typically very small) plus the cost of IPFS storage.

**Q: Who can be an admin/approver?**
A: The contract owner can grant approver roles to trusted addresses. This is managed through smart contract functions.

**Q: What happens to rejected feedback?**
A: They remain in pending state indefinitely. They're not deleted but not publicly visible.

---

## Troubleshooting During Demo

### If verification fails:
- Check wallet is connected
- Verify contract address is correct
- Check network is correct
- Look at browser console for errors

### If transaction fails:
- Ensure sufficient gas
- Check network congestion
- Verify wallet has funds

### If IPFS upload fails:
- Check Pinata API keys
- Verify internet connection
- Try with different content

---

## Demo Tips

1. **Start with Impact**: Lead with the problem (fake reviews, manipulation)
2. **Show, Don't Tell**: Actually go through the flows rather than just describing
3. **Emphasize Blockchain Benefits**: Regularly mention immutability, transparency, ownership
4. **Have Backup Data**: Keep some pre-created products/feedback in case creation fails
5. **Use Block Explorer**: Open transactions in explorer to show on-chain proof
6. **Handle Errors Gracefully**: If something fails, explain it's live blockchain (adds authenticity)
7. **Timing**: Practice to stay within 15-20 minutes
8. **Engagement**: Ask audience questions about their pain points with current review systems

---

## Post-Demo Actions

1. Share links:
   - Live app URL
   - GitHub repository
   - Block explorer for contract
   - Documentation

2. Provide test wallets (if applicable)

3. Share roadmap/future features

4. Collect feedback from audience

---

## Success Metrics

By the end of the demo, audience should understand:
- ✅ The problem with centralized review platforms
- ✅ How blockchain solves fake review issues
- ✅ The user journey (verify → create/review → approve)
- ✅ The technical implementation (IPFS + blockchain)
- ✅ The value proposition for both reviewers and product creators
