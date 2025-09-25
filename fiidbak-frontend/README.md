# Fiidbak Frontend

A modern, elegant frontend for the Fiidbak decentralized feedback platform built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Beautiful UI/UX** - Modern design with smooth animations and responsive layout
- 🔗 **Web3 Integration** - Wallet connection with RainbowKit and Wagmi
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🏆 **Badge System** - Visual representation of user reputation and voting power
- 🔍 **Smart Search** - Find products and feedback quickly
- 📊 **Real-time Stats** - Live updates on votes, approvals, and user activity
- 🛡️ **Admin Panel** - Content moderation and platform management tools

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Web3**: Wagmi, RainbowKit, and Ethers.js
- **Routing**: React Router v6
- **State Management**: React Query for server state
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fiidbak-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CONTRACT_ADDRESS_PRODUCT_NFT=0x...
VITE_CONTRACT_ADDRESS_BADGE_NFT=0x...
VITE_CONTRACT_ADDRESS_FEEDBACK_MANAGER=0x...
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # Generic UI components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── pages/              # Page components
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Key Components

### Pages
- **HomePage**: Landing page with features and featured products
- **ProductsPage**: Browse and search all products
- **ProductDetailPage**: Detailed product view with feedback
- **FeedbackPage**: Community feedback feed
- **ProfilePage**: User profile and statistics
- **CreateProductPage**: Product creation form
- **AdminPage**: Admin dashboard for moderation

### Components
- **ProductCard**: Product display card with stats
- **FeedbackCard**: Feedback display with voting
- **BadgeDisplay**: User badge tier visualization
- **LoadingSpinner**: Loading states
- **EmptyState**: Empty state illustrations

### Hooks
- **useProducts**: Product data management
- **useFeedback**: Feedback operations
- **useUser**: User data and stats
- **useContract**: Smart contract interactions

## Smart Contract Integration

The frontend integrates with three main smart contracts:

1. **ProductNFT**: Manages product creation and ownership
2. **BadgeNFT**: Handles user reputation and badge system
3. **FeedbackManager**: Manages feedback submission and voting

### Contract Methods

#### Product NFT
- `mintProduct(address, amount, ipfsCid)`: Create new product
- `getProduct(productId)`: Get product details
- `getAllProducts(count, startIndex)`: Get paginated products

#### Badge NFT
- `getUserTier(address)`: Get user's badge tier
- `getUserBadges(address)`: Get all user badges
- `mintBadge(address, tier, ipfsCid)`: Mint new badge

#### Feedback Manager
- `submitFeedback(productId, feedbackHash)`: Submit feedback
- `voteOnFeedback(feedbackId, isPositive)`: Vote on feedback
- `getFeedback(feedbackId)`: Get feedback details
- `getProductFeedbacks(productId)`: Get product feedback list

## IPFS Integration

The app uses IPFS for decentralized storage of:
- Product metadata (name, description, images)
- Feedback content
- Badge metadata

### IPFS Service
- Upload metadata and files
- Retrieve content from IPFS
- Handle IPFS URLs and CIDs

## Badge System

Users earn badges based on approved feedback count:
- **Seedling** (1+ approved feedback)
- **Wooden** (5+ approved feedback) - Can vote
- **Bronze** (10+ approved feedback) - 2x voting weight
- **Silver** (15+ approved feedback) - 3x voting weight
- **Gold** (20+ approved feedback) - 5x voting weight

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables in Netlify dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@fiidbak.com or join our Discord community.
