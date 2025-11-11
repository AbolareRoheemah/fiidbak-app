"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, User, Package, MessageSquare, Shield, AlertTriangle } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useSwitchChain } from "wagmi"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Feedback", href: "/feedbacks", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Admin", href: "/admin-dashboard", icon: Shield },
]

// Lisk Sepolia chainId: 4202 (decimal), 0x106A (hex)
// const LISK_SEPOLIA_CHAIN_ID = 4202
const BASE_SEPOLIA_CHAIN_ID = 84532

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isConnected, chain } = useAccount()
  const [showNetworkWarning, setShowNetworkWarning] = useState(false)
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const isWrongNetwork = isConnected && chain && chain.id !== BASE_SEPOLIA_CHAIN_ID

  useEffect(() => {
    setShowNetworkWarning(isWrongNetwork || false)
  }, [isWrongNetwork])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // --- Listen for route changes and reload if on /products, but only if navigated from another page ---
  const lastPathRef = useRef<string | null>(null)
  useEffect(() => {
    // Only reload if navigating to /products from a different path
    if (
      pathname === "/products" &&
      lastPathRef.current !== null &&
      lastPathRef.current !== "/products"
    ) {
      // Use setTimeout to avoid React hydration issues
      setTimeout(() => {
        window.location.reload()
      }, 0)
    }
    lastPathRef.current = pathname
  }, [pathname])
  // ----------------------------------------------------------------------

  // Handler to switch to Lisk Sepolia
  const handleSwitchChain = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.preventDefault()
      if (switchChain) {
        switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })
      }
    },
    [switchChain]
  )

  // Custom ConnectButton that shows "Switch Network" if on wrong chain
  function CustomConnectButton() {
    if (isWrongNetwork) {
      return (
        <button
          onClick={handleSwitchChain}
          disabled={isSwitching}
          className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <AlertTriangle className="text-yellow-400" size={18} />
          <span>{isSwitching ? "Switching..." : "Switch Network"}</span>
        </button>
      )
    }
    return (
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    )
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b bg-black w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Network warning */}
        {showNetworkWarning && (
          <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-2 rounded-md mt-4 mb-2">
            <AlertTriangle className="text-yellow-600" size={18} />
            <span>
              Please switch your wallet to the <b>Base Sepolia</b> network to use Fiidbak.
            </span>
            <button
              onClick={handleSwitchChain}
              disabled={isSwitching}
              className="ml-4 px-3 py-1 rounded bg-yellow-300 text-yellow-900 font-semibold hover:bg-yellow-400 transition-colors"
              style={{ minWidth: 120 }}
            >
              {isSwitching ? "Switching..." : "Switch Network"}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-0 sm:mb-0">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <img src="/logo.jpeg" alt="" className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold">Fiidbak</span>
            
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
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
            <CustomConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-70 transition-opacity duration-300 ${
          isOpen ? "block md:hidden" : "hidden"
        }`}
        style={{ backdropFilter: "blur(2px)" }}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-background border-l border-border z-[60] transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}
        style={{ boxShadow: isOpen ? "0 0 24px 0 rgba(0,0,0,0.2)" : undefined }}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Fiidbak</span>
            </Link>
            <button
              type="button"
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="px-4 pb-6 border-t border-border">
            <CustomConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
