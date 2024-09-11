import React, { useState } from 'react';
import Image from "next/image";
import { User, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequestData } from '@/app/ad-gallery/AdGalleryClient';

interface PublicGalleryItemDetailsProps {
    id: string;
    requestData: RequestData;
    generations: { id: string; url: string; type: string }[];
    created_at: string;
    onClose: () => void;
}

// format only MMM DD, YYYY
const formattedDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const PublicGalleryItemDetails: React.FC<PublicGalleryItemDetailsProps> = ({ requestData: item, generations, created_at, onClose }) => {
    const [currentImage, setCurrentImage] = useState(0);

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % generations.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + generations.length) % generations.length);

    const proxyUrl = (url: string) => `/api/proxy-image?url=${encodeURIComponent(url)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="flex h-[90vh] w-[90vw] bg-black rounded-lg overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-opacity duration-300 hover:bg-black/50"
                >
                    <X className="h-6 w-6" />
                </button>
                <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImage}
                            src={proxyUrl(generations[currentImage].url)}
                            alt={`Generated Image ${currentImage + 1}`}
                            className="w-full h-full object-contain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </AnimatePresence>
                    {generations.length > 1 && (
                        <>
                            <motion.button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-black/50"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </motion.button>
                            <motion.button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-black/50"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </motion.button>
                        </>
                    )}
                </div>
                <Card className="w-96 h-full overflow-y-auto rounded-none">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div>
                                <p className="text-md text-gray-600">Created At</p>
                                <p className="text-sm text-gray-500">{formattedDate(created_at)}</p>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-4">{item.headline}</h1>

                        <p className="text-gray-600">Prompt:</p>
                        <p className="text-gray-800 mb-6">
                            {item.body_text}
                            {item.additional_description && (
                                <>
                                    <br /><br />
                                    {item.additional_description}
                                </>
                            )}
                        </p>
                        <p className='text-gray-600'>Call to Action:</p>
                        <p className="text-gray-800 mb-6">{item.call_to_action_text}</p>
                        <div className="flex space-x-2 mb-6">
                            <Button variant="outline" size="sm">
                                {item.dimensions || 'AI'}
                            </Button>
                            <Button variant="outline" size="sm">
                                {item.number_of_variations} Variations
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2 mb-6">
                            <Button>Use as Template</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};