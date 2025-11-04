'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { useTheme } from './ThemeProvider';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explorer', label: 'Explorer' },
    { href: '/market', label: 'Market' },
    { href: '/logs', label: 'Logs' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 dark:border-white/10 border-gray-200 dark:bg-black/20 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-8 h-8 text-primary-400" />
            </motion.div>
            <span className="text-xl font-orbitron font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              SYNAPSE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 font-rajdhani font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary-400'
                    : 'text-gray-300 dark:text-gray-300 text-gray-700 hover:text-primary-400'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {mounted && <WalletButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}

