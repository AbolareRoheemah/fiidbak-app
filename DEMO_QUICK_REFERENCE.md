# Fiidbak Demo - Quick Reference

## Demo Flow (15-20 min)

### 1. Home Page (3 min)
- `/` - Introduce platform value prop
- Scroll through features
- Show recently added products
- Click "Browse Products"

**Key Message**: "Blockchain-verified feedback that can't be deleted or manipulated"

---

### 2. Products Listing (2 min)
- `/products` - Show all products
- Click on a product

---

### 3. Product Details (3 min)
- `/products/[id]` - View product info
- Scroll to feedbacks
- Point out: content, reviewer address, timestamp

**Key Message**: "Every review permanently on-chain"

---

### 4. Wallet Verification (4 min)
- Connect Wallet 2 (regular user)
- Navigate to `/create-product`
- Verification modal appears
- Click "Verify Wallet"
- Sign off-chain message (free)
- Sign on-chain transaction
- Success!

**Key Message**: "One-time verification prevents spam"

---

### 5. Create Product (3 min)
- Fill form: Name, Description, Image
- Submit
- IPFS upload → Transaction → Success
- View new product

**Key Message**: "Metadata on IPFS, reference on-chain"

---

### 6. Submit Feedback (3 min)
- Switch to Wallet 3
- Verify if needed (or skip)
- Find product
- Write feedback
- Submit → IPFS → Transaction
- Show "pending" state

**Key Message**: "Feedback needs admin approval before visible"

---

### 7. Admin Dashboard (4 min)
- Switch to Wallet 1 (admin)
- Navigate to `/admin-dashboard`
- Show stats
- View pending feedback
- Approve feedback → Transaction
- Show in "Approved" tab
- Refresh product page

**Key Message**: "Role-based moderation, approved reviews are permanent"

---

## Opening Script

> "Welcome to Fiidbak - where every product review is verified and stored permanently on the blockchain. Unlike Amazon or Yelp, no one can delete or manipulate reviews here - not even us. Let me show you how it works..."

---

## Closing Script

> "As you've seen, Fiidbak solves the trust problem in online reviews by leveraging blockchain's immutability and transparency. Every review is verifiable, permanent, and owned by the reviewer as an NFT. This creates a trustworthy ecosystem for both consumers and product creators."

---

## Wallets Needed

| Wallet | Role | Purpose |
|--------|------|---------|
| Wallet 1 | Admin/Approver | Moderate feedback |
| Wallet 2 | Regular User | Create products |
| Wallet 3 | Regular User | Submit feedback |

---

## Key Points to Emphasize

✅ Immutability - Reviews can't be deleted
✅ Transparency - All data on-chain
✅ Verification - Prevents spam/bots
✅ Ownership - Reviews as NFTs
✅ Decentralization - IPFS storage
✅ Trust - No single point of control

---

## Common Questions

**"Can reviews be deleted?"**
No, once approved and on-chain, they're permanent.

**"What prevents spam?"**
Wallet verification + gas costs + admin moderation.

**"What blockchain?"**
[Your network] - chosen for low fees and speed.

**"Who can be an admin?"**
Contract owner grants approver role to trusted addresses.

---

## Backup Plan

If demo fails:
- Have screenshots/video ready
- Use testnet if mainnet is slow
- Show block explorer transactions
- Have pre-created products/feedback

---

## Demo Checklist

**Before Starting:**
- [ ] Frontend running
- [ ] All 3 wallets ready
- [ ] Test product details prepared
- [ ] Block explorer tab open
- [ ] Wallets have gas

**During Demo:**
- [ ] Show transactions in explorer
- [ ] Point out gas costs
- [ ] Emphasize "on-chain" regularly
- [ ] Show wallet signatures
- [ ] Highlight immutability

**After Demo:**
- [ ] Share app URL
- [ ] Share GitHub
- [ ] Share contract address
- [ ] Answer questions
- [ ] Collect feedback
