import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaEdit, FaSync } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface CallToActionSelectorProps {
  adData: {
    businessInfo: BusinessInfo | null;
    callToAction: string;
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

export default function CallToActionSelector({ adData, updateAdData, onNext, onPrev }: CallToActionSelectorProps) {
  const [suggestedCTAs, setSuggestedCTAs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customCTA, setCustomCTA] = useState('');

  const generateSuggestions = async () => {
    if (adData.businessInfo) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/generate-cta-suggestions', {
          businessInfo: adData.businessInfo
        });
        setSuggestedCTAs(response.data.callToActions);
      } catch (error) {
        console.error('Error generating CTA suggestions:', error);
        setError('Failed to generate suggestions. Using default options.');
        setSuggestedCTAs([
          'Buy Now',
          'Learn More',
          'Sign Up Today',
          'Get Started',
          'Shop Now',
          'Discover More',
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [adData.businessInfo]);

  const handleCustomCTASubmit = () => {
    if (customCTA.trim()) {
      updateAdData({ callToAction: customCTA.trim() });
      setIsCustomizing(false);
    }
  };

  return (
    <Card className="w-full bg-white overflow-hidden">
      <CardContent className="p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
        >
          Call-to-Action Selector
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaBullhorn className="mr-2 text-primary" />
              Select Your Call-to-Action
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
                  <p>Regenerate CTA suggestions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="mb-6 text-gray-600">
            Choose a compelling call-to-action that will encourage your audience to take the next step:
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
              >
                <RadioGroup
                  value={adData.callToAction}
                  onValueChange={(value) => updateAdData({ callToAction: value })}
                  className="space-y-3"
                >
                  {suggestedCTAs.map((cta) => (
                    <motion.div
                      key={cta}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <RadioGroupItem value={cta} id={`cta-${cta}`} />
                      <Label htmlFor={`cta-${cta}`} className="flex-grow cursor-pointer">{cta}</Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </motion.div>
            </AnimatePresence>
          )}

          {isCustomizing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <Input
                value={customCTA}
                onChange={(e) => setCustomCTA(e.target.value)}
                placeholder="Enter your custom CTA"
                className="mb-2"
              />
              <Button onClick={handleCustomCTASubmit}>Submit Custom CTA</Button>
            </motion.div>
          ) : (
            <Button onClick={() => setIsCustomizing(true)} variant="outline" className="mt-6">
              <FaEdit className="mr-2" />
              Create Custom CTA
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between mt-12"
          >
            <Button onClick={onPrev} variant="outline" className="px-8 py-3 text-lg">Back</Button>
            <Button
              onClick={onNext}
              disabled={!adData.callToAction}
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