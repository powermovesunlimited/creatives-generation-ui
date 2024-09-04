import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPencilAlt, FaTrash, FaTimes, FaImage, FaCheckCircle } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RelevantImage {
  id: string;
  src: string;
  alt: string;
  relevanceAnalysis?: {
    isRelevant?: boolean;
    relevanceScore?: number;
    explanation?: string;
    suggestedUse?: string;
  };
}

interface EnhancedImageGalleryProps {
  images: RelevantImage[] | undefined;
  onRemove: (id: string) => void;
  onLogoSelect: (image: RelevantImage | null) => void;
  onReferenceSelect: (image: RelevantImage | null) => void;
  selectedLogo?: RelevantImage | File;
  selectedReference?: RelevantImage | File;
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

const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({ 
  images, 
  onRemove, 
  onLogoSelect, 
  onReferenceSelect, 
  selectedLogo, 
  selectedReference 
}) => {
  const [selectedImage, setSelectedImage] = useState<RelevantImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const handleImageClick = (image: RelevantImage) => {
    setSelectedImage(image);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setImageToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (imageToDelete) {
      onRemove(imageToDelete);
      setImageToDelete(null);
    }
  };

  const handleLogoSelect = (e: React.MouseEvent, image: RelevantImage) => {
    e.stopPropagation();
    onLogoSelect(isLogo(image) ? null : image);
  };

  const handleReferenceSelect = (e: React.MouseEvent, image: RelevantImage) => {
    e.stopPropagation();
    onReferenceSelect(isReference(image) ? null : image);
  };

  const isLogo = (image: RelevantImage) => selectedLogo && 'src' in selectedLogo && selectedLogo.src === image.src;
  const isReference = (image: RelevantImage) => selectedReference && 'src' in selectedReference && selectedReference.src === image.src;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaPencilAlt className="mr-2 text-indigo-500" />
        Relevant Images
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence>
          {images?.map((image) => (
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
                  Relevance: {image.relevanceAnalysis?.relevanceScore ?? 'N/A'}
                  {image.relevanceAnalysis?.relevanceScore !== undefined && '%'}
                </p>
              </motion.div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    isLogo(image) ? 'bg-green-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={(e) => handleLogoSelect(e, image)}
                  title={isLogo(image) ? "Deselect Logo" : "Select as Logo"}
                >
                  {isLogo(image) ? <FaCheckCircle size={16} /> : <FaImage size={16} className="text-green-500" />}
                </button>
                <button
                  className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    isReference(image) ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={(e) => handleReferenceSelect(e, image)}
                  title={isReference(image) ? "Deselect Reference" : "Select as Reference"}
                >
                  {isReference(image) ? <FaCheckCircle size={16} /> : <FaImage size={16} className="text-blue-500" />}
                </button>
              </div>
              <button
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={(e) => handleDeleteClick(e, image.id)}
              >
                <FaTrash size={16} />
              </button>
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
            <p className="mt-4 text-sm">{selectedImage.relevanceAnalysis?.explanation ?? 'No explanation available.'}</p>
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
    </section>
  );
};

export default EnhancedImageGallery;