import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Percent } from 'lucide-react';
import type { ResearchPoint } from '../types';

interface ResearchListProps {
  points: ResearchPoint[];
  onPointClick: (point: ResearchPoint) => void;
}

export const ResearchList: React.FC<ResearchListProps> = ({ points, onPointClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto space-y-4"
    >
      {points.map((point, index) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onPointClick(point)}
          className="p-6 bg-white dark:bg-[#222] rounded-xl shadow-lg hover:shadow-xl 
                     transition-all cursor-pointer border-2 border-transparent
                     hover:border-secondary/20 dark:hover:border-secondary/10"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-poppins font-semibold text-primary dark:text-white">
              {point.topic}
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-secondary">
                <Percent className="w-4 h-4 mr-1" />
                <span className="font-medium">
                  {Math.round(
                    (point.supportingPapers.reduce((acc, paper) => acc + paper.accuracy, 0) /
                      point.supportingPapers.length) * 100
                  )}% accuracy
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-accent" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};