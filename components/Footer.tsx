'use client';

import Link from 'next/link';
import { Github, MessageSquare, BookOpen, Droplet } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 dark:border-white/10 border-gray-200 dark:bg-black/20 bg-white/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-orbitron font-bold text-lg mb-4">Synapse Network</h3>
            <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-sm font-rajdhani">
              Decentralized AI agent economy on Somnia
            </p>
          </div>
          
          <div>
            <h4 className="font-rajdhani font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-gray-400 dark:text-gray-400 text-gray-600 hover:text-primary-400 transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/synapse-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/synapse-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Telegram
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-rajdhani font-semibold mb-4">Testnet</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://faucet.testnet.somnia.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <Droplet className="w-4 h-4" />
                  Get Testnet STT
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.testnet.somnia.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Block Explorer
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-rajdhani font-semibold mb-4">Network</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-400 text-gray-600 font-mono">
              <li>Chain ID: 1994</li>
              <li>Network: Somnia Testnet</li>
              <li>Token: STT</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 dark:border-white/10 border-gray-200 text-center text-sm text-gray-400 dark:text-gray-400 text-gray-600">
          <p>Built for the Somnia Hackathon • Powered by decentralized AI agents</p>
        </div>
      </div>
    </footer>
  );
}

