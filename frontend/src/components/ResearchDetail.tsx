import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, Percent } from 'lucide-react';
import type { ResearchPoint } from '../types';

interface ResearchDetailProps {
  point: ResearchPoint;
  onBack: () => void;
}

export const ResearchDetail: React.FC<ResearchDetailProps> = ({ point, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-4xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center text-secondary hover:text-accent mb-8 
                   font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to results
      </button>

      <h2 className="font-poppins text-4xl font-bold text-primary dark:text-white mb-8">
        {point.topic}
      </h2>

      <div className="space-y-12">
        <section>
          <div className="flex items-center mb-6">
            <ThumbsUp className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="font-poppins text-2xl font-semibold text-primary dark:text-white">
              Supporting Research
            </h3>
          </div>
          {point.supportingPapers.map((paper) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-white dark:bg-[#222] rounded-xl shadow-lg
                         border-2 border-transparent hover:border-secondary/20
                         dark:hover:border-secondary/10 transition-all"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-poppins font-semibold text-primary dark:text-white">
                  {paper.title}
                </h4>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-primary/60 dark:text-white/60 mt-2">
                {paper.authors.join(', ')} ({paper.year})
              </p>
              <p className="mt-4 text-primary/80 dark:text-white/80">{paper.abstract}</p>
              <div className="mt-4 flex items-center text-secondary">
                <Percent className="w-4 h-4 mr-1" />
                <span className="font-medium">{paper.accuracy * 100}% accuracy</span>
              </div>
            </motion.div>
          ))}
        </section>

        <section>
          <div className="flex items-center mb-6">
            <ThumbsDown className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="font-poppins text-2xl font-semibold text-primary dark:text-white">
              Opposing Research
            </h3>
          </div>
          {point.opposingPapers.map((paper) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-white dark:bg-[#222] rounded-xl shadow-lg
                         border-2 border-transparent hover:border-secondary/20
                         dark:hover:border-secondary/10 transition-all"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-poppins font-semibold text-primary dark:text-white">
                  {paper.title}
                </h4>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-primary/60 dark:text-white/60 mt-2">
                {paper.authors.join(', ')} ({paper.year})
              </p>
              <p className="mt-4 text-primary/80 dark:text-white/80">{paper.abstract}</p>
              <div className="mt-4 flex items-center text-secondary">
                <Percent className="w-4 h-4 mr-1" />
                <span className="font-medium">{paper.accuracy * 100}% accuracy</span>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </motion.div>
  );
};