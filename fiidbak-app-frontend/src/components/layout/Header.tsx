"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, User, Package, MessageSquare, Shield, AlertTriangle } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Admin", href: "/admin-dashboard", icon: Shield },
]

// Lisk Sepolia chainId: 4202 (decimal), 0x106A (hex)
const LISK_SEPOLIA_CHAIN_ID = 4202

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isConnected, chain } = useAccount()
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)

  useEffect(() => {
    if (isConnected && chain && chain.id !== LISK_SEPOLIA_CHAIN_ID) {
      setShowNetworkWarning(true)
    } else {
      setShowNetworkWarning(false)
    }
  }, [chain, isConnected])

  return (
    <nav className="sticky top-0 z-50 glass-card border-b bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Network warning */}
        {showNetworkWarning && (
          <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-2 rounded-md mt-4 mb-2">
            <AlertTriangle className="text-yellow-600" size={18} />
            <span>
              Please switch your wallet to the <b>Lisk Sepolia</b> network to use Fiidbak.
            </span>
          </div>
        )}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Fiidbak</span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-border">
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="address"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
