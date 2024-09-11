import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export const shimmerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse" as const,
    }
  }
};

export const ShimmerEffect = () => (
  <motion.div 
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          when: "beforeChildren",
          staggerChildren: 0.1,
        },
      },
    }}
  >
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={index}
        className="bg-gray-200 rounded-lg h-64"
        variants={shimmerVariants}
      ></motion.div>
    ))}
  </motion.div>
);

export const processingVariants = {
  processing: {
    opacity: [1, 0.7, 1],
    scale: [1, 0.98, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  default: {
    opacity: 1,
    scale: 1,
  },
};

export const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="container mx-auto p-4 text-center">
    <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
    <p className="text-muted-foreground">{error}</p>
    <Button onClick={onRetry} className="mt-4">
      Retry
    </Button>
  </div>
);

export const NoGenerationsFound: React.FC = () => (
  <p className="text-center text-muted-foreground">No ad generations found. Start your creative journey!</p>
);

export const LoadMoreButton: React.FC<{ onClick: () => void; isLoading: boolean }> = ({ onClick, isLoading }) => (
  <div className="mt-8 text-center">
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Load More'}
    </Button>
  </div>
);