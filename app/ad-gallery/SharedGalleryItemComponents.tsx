import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { RequestData } from './AdGalleryClient';

export const StatusIcon = ({ status }: { status: string }) => {
  if (status.startsWith('Queued') || status === 'Processing') {
    return <Clock className="text-amber-400" />;
  } else if (status === 'completed') {
    return <CheckCircle className="text-emerald-400" />;
  } else if (status === 'Error') {
    return <XCircle className="text-rose-400" />;
  }
  return null;
};

export interface SharedGalleryItemProps {
  generations: { id: string; url: string; type: string }[];
  requestData: RequestData;
  status: string;
  queue_position?: number | null;
  error_message?: string;
  id: string;
  created_at: string;
  gradient: string;
  showStatus?: boolean;
  children?: ReactNode;
}

export const SharedGalleryItem: React.FC<SharedGalleryItemProps> = ({
  generations,
  requestData,
  status,
  showStatus = true,
  children
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const proxyUrl = (url: string) => `/api/proxy-image?url=${encodeURIComponent(url)}`;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % generations.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + generations.length) % generations.length);
  };

  return (
    <motion.div
      className="w-full aspect-[3/4] overflow-hidden rounded-3xl shadow-lg transition-all duration-500 ease-in-out bg-gray-100 dark:bg-gray-800"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        <motion.div
          className="absolute inset-0 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {generations.length > 0 ? (
            <motion.img
              key={currentImage}
              src={proxyUrl(generations[currentImage].url)}
              alt={`Generated Image ${currentImage + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, rotateY: -5 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 5 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: 360,
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              >
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
              </motion.div>
            </div>
          )}
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4"
            >
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-white mb-2 line-clamp-2"
              >
                {requestData.headline}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-200 mb-2 line-clamp-3"
              >
                {requestData.body_text}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-2"
              >
                {showStatus && (
                    <StatusIcon status={status} />)}
              </motion.div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
        
        {generations.length > 1 && (
          <>
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-opacity duration-300 hover:bg-black/50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-opacity duration-300 hover:bg-black/50"
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};