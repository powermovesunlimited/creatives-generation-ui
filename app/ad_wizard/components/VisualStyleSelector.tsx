import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaUpload, FaSync, FaCheck } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from 'axios';

interface BusinessInfo {
  business_name: string;
  business_type: string;
  description: string;
  key_products_or_services: string[];
}

interface VisualStyleSelectorProps {
  adData: {
    businessInfo: BusinessInfo | null;
    visualTheme: string;
    customImage: File | null;
  };
  updateAdData: (newData: Partial<typeof adData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const LoadingSpinner: React.FC = () => (
  <motion.div
    className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

export default function VisualStyleSelector({ adData, updateAdData, onNext, onPrev }: VisualStyleSelectorProps) {
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (adData.businessInfo) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/generate-visual-style-suggestions', {
          businessInfo: adData.businessInfo
        });
        console.log("Visual Style Suggestions: ", response.data.visualThemes);
        setSuggestedThemes(response.data.visualThemes);
      } catch (error) {
        console.error('Error generating visual style suggestions:', error);
        setError('Failed to generate suggestions. Using default options.');
        setSuggestedThemes([
          'Modern', 'Elegant', 'Bold', 'Minimalist', 'Vibrant', 'Professional'
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [adData.businessInfo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateAdData({ customImage: e.target.files[0] });
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
      <CardContent className="p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
        >
          Visual Style Selector
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaPalette className="mr-2 text-primary" />
              Choose Your Visual Style
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={generateSuggestions} disabled={isLoading}>
                    <FaSync className="mr-2" />
                    Regenerate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Regenerate style suggestions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="mb-6 text-gray-600">
            Select a visual theme that aligns with your brand's aesthetics:
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-red-500 mb-4">{error}</p>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
              >
                {suggestedThemes.map((theme) => (
                  <motion.div
                    key={theme}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                      adData.visualTheme === theme
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                        : 'bg-white hover:shadow-lg'
                    }`}
                    onClick={() => updateAdData({ visualTheme: theme })}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{theme}</span>
                      {adData.visualTheme === theme && <FaCheck />}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Custom Image Upload (Optional)</h3>
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md hover:from-purple-600 hover:to-indigo-600 transition-all duration-200">
                  <FaUpload />
                  <span>{adData.customImage ? 'Change Image' : 'Upload Image'}</span>
                </div>
              </Label>
              {adData.customImage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <FaCheck className="text-green-500" />
                  <span>{adData.customImage.name}</span>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between mt-12"
          >
            <Button onClick={onPrev} variant="outline" className="px-8 py-3 text-lg">Back</Button>
            <Button
              onClick={onNext}
              disabled={!adData.visualTheme}
              className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              Next
            </Button>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}