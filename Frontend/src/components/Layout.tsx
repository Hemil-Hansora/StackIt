import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state } = useApp();

  return (
    <div className={`min-h-screen transition-colors ${
      state.theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'
    }`}>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
              state.theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-200/30'
            } blur-3xl`}></div>
            <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
              state.theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-200/30'
            } blur-3xl`}></div>
          </div>
          {children}
        </div>
      </motion.main>
    </div>
  );
}