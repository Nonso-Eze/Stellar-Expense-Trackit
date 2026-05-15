"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, Moon, Sun, Menu, X, Zap, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useAppStore } from "@/store/app-store";
import { shortenAddress } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/groups", label: "Groups" },
  { href: "/transactions", label: "Transactions" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { walletAddress, walletConnected, connect, disconnect, isLoading } = useWallet();
  const { user, setUser } = useAppStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    disconnect();
    router.push("/");
  };

  const handleWalletClick = async () => {
    if (walletConnected) {
      disconnect();
      toast({ title: "Wallet disconnected" });
    } else {
      await connect();
      if (walletAddress) {
        toast({ title: "Wallet connected", description: shortenAddress(walletAddress) });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">StellarSplit</span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Wallet button */}
          {user && (
            <Button
              variant={walletConnected ? "outline" : "gradient"}
              size="sm"
              onClick={handleWalletClick}
              disabled={isLoading}
              className="hidden sm:flex gap-2"
            >
              <Wallet className="h-4 w-4" />
              {walletConnected ? (
                <span className="flex items-center gap-1">
                  {shortenAddress(walletAddress!)}
                  <Badge variant="success" className="text-xs py-0">Connected</Badge>
                </span>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User menu */}
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {user.displayName}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            <Button
              variant={walletConnected ? "outline" : "gradient"}
              size="sm"
              onClick={handleWalletClick}
              className="w-full"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {walletConnected ? shortenAddress(walletAddress!) : "Connect Wallet"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout ({user.displayName})
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
