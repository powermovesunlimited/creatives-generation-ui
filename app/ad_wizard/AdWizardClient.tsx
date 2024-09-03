"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import PrePopulatedOptions from './components/PrePopulatedOptions';
import CallToActionSelector from './components/CallToActionSelector';
import VisualStyleSelector from './components/VisualStyleSelector';
import PreviewAndCustomize from './components/PreviewAndCustomize';
import FinalReview from './components/FinalReview';

const steps = [
  'welcome',
  'prePopulated',
  'callToAction',
  'visualStyle',
  'preview',
  'finalReview'
];

interface BusinessInfo {
  business_name: string;
  business_type: string;
  description: string;
  key_products_or_services: string[];
}

interface AdContent {
  headline: string;
  body_text: string;
  call_to_action_text: string;
  instructional_prompt: string;
}

interface RelevantImage {
  src: string;
  alt: string;
  desc: string;
  score: number;
  type: string;
  relevanceAnalysis: {
    isRelevant: boolean;
    relevanceScore: number;
    explanation: string;
    suggestedUse?: string;
  };
}

interface RequestData {
  headline: string;
  body_text: string;
  additional_description: string;
  image: string;
  number_of_variations: number;
  call_to_action_text: string;
  instructional_prompt: string;
  dimensions: string;
}

export default function AdWizardClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [adData, setAdData] = useState<RequestData & {
    url: string;
    businessInfo: BusinessInfo | null;
    aiContent: AdContent | null;
    businessType: string;
    visualTheme: string;
    customImage: string | null;
    relevantImages: RelevantImage[];
  }>({
    url: '',
    businessInfo: null,
    aiContent: null,
    businessType: '',
    headline: "",
    body_text: "",
    additional_description: "",
    image: "Generate with tool",
    call_to_action_text: "",
    instructional_prompt: "",
    number_of_variations: 1,
    dimensions: "1080x1080",
    visualTheme: '',
    customImage: null,
    relevantImages: [],
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateAdData = (newData: Partial<typeof adData>) => {
    setAdData((prev) => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return <WelcomeScreen adData={adData} updateAdData={updateAdData} onNext={nextStep} />;
      case 'prePopulated':
        return <PrePopulatedOptions adData={adData} updateAdData={updateAdData} onNext={nextStep} onPrev={prevStep} />;
      case 'callToAction':
        return <CallToActionSelector adData={adData} updateAdData={updateAdData} onNext={nextStep} onPrev={prevStep} />;
      case 'visualStyle':
        return <VisualStyleSelector adData={adData} updateAdData={updateAdData} onNext={nextStep} onPrev={prevStep} />;
      case 'preview':
        return <PreviewAndCustomize adData={adData} updateAdData={updateAdData} onNext={nextStep} onPrev={prevStep} />;
      case 'finalReview':
        return <FinalReview adData={adData} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}