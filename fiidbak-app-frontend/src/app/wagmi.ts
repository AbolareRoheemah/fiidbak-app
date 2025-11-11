import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  baseSepolia,
  liskSepolia
} from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'My Fiidbak App',
  projectId: '001',
  chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia, liskSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/snKazgbUVHd4AN0mGV4ql"),
    [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com/'),
  },
});