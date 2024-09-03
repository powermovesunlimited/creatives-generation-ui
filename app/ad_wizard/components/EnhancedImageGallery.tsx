import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPencilAlt, FaTrash, FaTimes } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RelevantImage {
  id: string;
  src: string;
  alt: string;
  relevanceAnalysis: {
    isRelevant: boolean;
    relevanceScore: number;
    explanation: string;
    suggestedUse?: string;
  };
}

interface EnhancedImageGalleryProps {
  images: RelevantImage[] | undefined;
  onRemove: (id: string) => void;
}

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}> = ({ isOpen, onClose, onConfirm, title, description }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({ images, onRemove }) => {
  const [selectedImage, setSelectedImage] = useState<RelevantImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  useEffect(() => {
    console.log('ImageToDelete state changed:', imageToDelete);
  }, [imageToDelete]);

  const handleImageClick = (image: RelevantImage) => {
    setSelectedImage(image);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('Delete icon clicked for image:', id);
    setImageToDelete(id);
  };

  const handleConfirmDelete = () => {
    console.log('Confirming delete for image:', imageToDelete);
    if (imageToDelete) {
      setDeletingImage(imageToDelete);
      setImageToDelete(null);
      // Wait for the animation to complete before actually removing the image
      setTimeout(() => {
        onRemove(imageToDelete);
        setDeletingImage(null);
      }, 500); // 500ms matches the duration of the exit animation
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaPencilAlt className="mr-2 text-indigo-500" />
        Relevant Images
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence>
          {images?.slice(0, 9).map((image) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0,
                rotate: 360,
                transition: { duration: 0.5 }
              }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-4"
              >
                <p className="text-white text-sm">
                  Relevance: {image.relevanceAnalysis.relevanceScore}%
                </p>
              </motion.div>
              <button
                className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={(e) => handleDeleteClick(e, image.id)}
              >
                <FaTrash size={12} />
              </button>
              {deletingImage === image.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center"
                >
                  <p className="text-white font-bold">Deleting...</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white p-4 rounded-lg max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes size={24} />
            </button>
            <img src={selectedImage.src} alt={selectedImage.alt} className="w-full h-auto" />
            <p className="mt-4 text-sm">{selectedImage.relevanceAnalysis.explanation}</p>
          </div>
        </motion.div>
      )}
      <ConfirmationModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
      />
      {/* Debug indicator */}
      {imageToDelete && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded">
          Modal should be open for image: {imageToDelete}
        </div>
      )}
    </section>
  );
};

export default EnhancedImageGallery;