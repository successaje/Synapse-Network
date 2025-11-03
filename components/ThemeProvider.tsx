'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Load saved theme or use system preference
      const savedTheme = localStorage.getItem('theme') as Theme;
      let initialTheme: Theme = 'dark';
      
      if (savedTheme) {
        initialTheme = savedTheme;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
      }
      
      // Apply theme immediately
      root.classList.remove('light', 'dark');
      root.classList.add(initialTheme);
      root.setAttribute('data-theme', initialTheme);
      
      setTheme(initialTheme);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const root = document.documentElement;
      // Remove both theme classes
      root.classList.remove('light', 'dark');
      // Add the current theme class
      root.classList.add(theme);
      // Also set data attribute for additional styling hooks
      root.setAttribute('data-theme', theme);
      // Save to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Always provide the context, even before mounted
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

