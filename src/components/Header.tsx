import React, { useState, useEffect } from 'react';
import { Recycle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }, 10000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-10 transition-all duration-300 ${
        isScrolled ? 'bg-sage-700 shadow-md' : 'bg-sage-600'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Recycle 
              size={32} 
              className={`mr-2 text-earth-50 transition-transform duration-300 ${
                isScrolled ? 'rotate-180' : ''
              }`} 
            />
            <h1 className="text-xl font-bold text-earth-50">EcoScan</h1>
          </motion.div>
          
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Cpu 
              size={16} 
              className={`mr-1 text-earth-50 ${
                showPulse ? 'animate-pulse' : ''
              }`} 
            />
            <span className={`text-sm px-2 py-1 rounded-full bg-sage-700 text-earth-50 transition-all duration-300 ${
              isScrolled ? 'bg-sage-800' : ''
            } ${showPulse ? 'animate-pulse' : ''}`}>
              AI Powered
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;