import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const SearchAnimation: React.FC = () => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Search className="w-16 h-16 text-[#478DF5]" />
      </motion.div>
    </motion.div>
  );
};