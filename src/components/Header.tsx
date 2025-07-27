import { motion } from 'framer-motion';
import { Moon, Sun, Menu, Scroll } from 'lucide-react';
import { SearchBox } from './SearchBox';
import { useState } from 'react';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (query: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onMenuToggle: () => void;
}

export function Header({ 
  searchValue, 
  onSearchChange, 
  onSearch, 
  isDark, 
  onThemeToggle, 
  onMenuToggle 
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section - Logo and Search */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 rounded-xl bg-gradient-gold">
                <Scroll className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-museum-gold">
                  PastPeek
                </h1>
                <p className="text-xs text-muted-foreground font-sans">
                  Digital Time Museum
                </p>
              </div>
            </motion.div>

            {/* Search Box */}
            <div className="flex-1 max-w-xl">
              <SearchBox
                value={searchValue}
                onChange={onSearchChange}
                onSearch={onSearch}
              />
            </div>
          </div>

          {/* Right section - Time, Theme, Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Current Time */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:block text-right"
            >
              <div className="text-sm font-medium text-foreground font-mono">
                {currentTime.toLocaleTimeString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  hour12: false 
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                IST
              </div>
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onThemeToggle}
              className="p-2 rounded-xl bg-card hover:bg-secondary border border-border hover:border-museum-gold/50 transition-all duration-200"
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-museum-gold" />
                ) : (
                  <Moon className="w-5 h-5 text-museum-gold" />
                )}
              </motion.div>
            </motion.button>

            {/* Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMenuToggle}
              className="p-2 rounded-xl bg-card hover:bg-secondary border border-border hover:border-museum-gold/50 transition-all duration-200"
              title="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Fix React import
import React from 'react';