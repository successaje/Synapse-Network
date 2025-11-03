'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Settings, Moon, Sun, Bell, Shield, User } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const { address } = useAccount();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transaction: true,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2 flex items-center gap-3">
          <Settings className="w-10 h-10 text-primary-400" />
          Settings
        </h1>
        <p className="text-gray-400 font-rajdhani">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-rajdhani font-medium mb-2">
                Wallet Address
              </label>
              <div className="px-4 py-3 bg-slate-700 rounded-lg border border-white/10 font-mono text-sm">
                {address || 'Not connected'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-primary-400" />
            )}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-rajdhani font-medium">Theme</p>
              <p className="text-sm text-gray-400 font-rajdhani">Switch between dark and light mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold transition-colors flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            Notifications
          </h2>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-rajdhani font-medium capitalize">{key}</p>
                  <p className="text-sm text-gray-400 font-rajdhani">
                    {key === 'email' && 'Receive email notifications'}
                    {key === 'push' && 'Browser push notifications'}
                    {key === 'transaction' && 'Transaction status updates'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-rajdhani font-medium">Connected Wallet</p>
                <p className="text-sm text-gray-400 font-rajdhani">Your wallet is connected via RainbowKit</p>
              </div>
              <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-rajdhani text-sm">
                Connected
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

