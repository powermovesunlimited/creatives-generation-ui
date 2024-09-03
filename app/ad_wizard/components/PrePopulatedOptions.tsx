import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import axios from 'axios';

import DynamicRevealSection from './DynamicRevealSection';
import ProductsServicesCarousel from './ProductsServicesCarousel';
import EnhancedImageGallery from './EnhancedImageGallery';
import SuggestedOptionsSection from './SuggestedOptionsSection';
import NavigationButtons from './NavigationButtons';

interface BusinessInfo {
  business_name: string;
  business_type: string;
  description: string;
  key_products_or_services: string[];
}

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

interface AdData {
  businessInfo: BusinessInfo | null;
  businessType: string;
  headline: string;
  adCopy: string;
  relevantImages?: RelevantImage[];
}

interface RedesignedAdWizardProps {
  adData: AdData;
  updateAdData: (newData: Partial<AdData>) => void;
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

const RedesignedAdWizard: React.FC<RedesignedAdWizardProps> = ({
  adData,
  updateAdData,
  onNext,
  onPrev,
}) => {
  const [suggestedOptions, setSuggestedOptions] = useState<{
    businessTypes: string[];
    headlines: string[];
    adCopies: string[];
  }>({
    businessTypes: [],
    headlines: [],
    adCopies: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (adData.businessInfo) {
      setIsLoadingSuggestions(true);
      setError(null);
      try {
        const response = await axios.post('/api/generate-ad-suggestions', {
          businessInfo: adData.businessInfo,
        });
        setSuggestedOptions(response.data);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setError('Failed to generate suggestions. Please try again.');
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [adData.businessInfo]);

  const handleRemoveImage = (id: string) => {
    if (adData.relevantImages) {
      const updatedImages = adData.relevantImages.filter(img => img.id !== id);
      updateAdData({ relevantImages: updatedImages });
    }
  };

  return (
    <Card className="w-full bg-white overflow-hidden">
      <CardContent className="p-8">

        <DynamicRevealSection title="Business Profile" data={adData.businessInfo} />
        
        <ProductsServicesCarousel items={adData.businessInfo?.key_products_or_services} />
        
        <EnhancedImageGallery images={adData.relevantImages} onRemove={handleRemoveImage} />
        
        <SuggestedOptionsSection
          options={suggestedOptions}
          isLoading={isLoadingSuggestions}
          onUpdate={updateAdData}
          onRegenerate={generateSuggestions}
          currentSelections={adData}
        />
        
        <NavigationButtons
          onPrev={onPrev}
          onNext={onNext}
          isNextDisabled={isLoadingSuggestions || !!error || !adData.businessInfo}
        />

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default RedesignedAdWizard;