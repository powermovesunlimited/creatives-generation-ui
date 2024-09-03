import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaSpinner, FaEye, FaEdit, FaImage } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { handleAdSubmission, RequestData } from "@/app/generate-ad/handleAdSubmission";
import { useRouter } from 'next/navigation';

interface FinalReviewProps {
  adData: {
    headline: string;
    adCopy: string;
    callToAction: string;
    visualTheme: string;
    customImage: File | null;
  };
  onPrev: () => void;
  onEdit: (section: string) => void;
}

const AdPreview: React.FC<{ adData: FinalReviewProps['adData'] }> = ({ adData }) => {
  return (
    <motion.div
      className="relative bg-white p-6 rounded-lg shadow-lg overflow-hidden"
      style={{
        aspectRatio: '1200/628',
        backgroundImage: adData.customImage ? `url(${URL.createObjectURL(adData.customImage)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 h-full flex flex-col justify-between text-white">
        <motion.h2
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {adData.headline}
        </motion.h2>
        <motion.p
          className="text-lg mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {adData.adCopy}
        </motion.p>
        <motion.button
          className="bg-white text-black font-bold py-2 px-4 rounded-full self-start"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          {adData.callToAction}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function FinalReview({ adData, onPrev, onEdit }: FinalReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const requestData: RequestData = {
        headline: adData.headline,
        body_text: adData.adCopy,
        call_to_action_text: adData.callToAction,
        instructional_prompt: `Generate an ad with a ${adData.visualTheme} theme.`,
        number_of_variations: 1,
        dimensions: '1080x1080',
        additional_description: '',
        image: adData.customImage ? 'Custom image uploaded' : 'Generate with tool',
      };

      await handleAdSubmission(requestData, router, setShowEmailPrompt);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting ad:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      <CardContent className="p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
        >
          Final Review
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-6 text-gray-600 text-center">
            Review your ad one last time before submission. Click on any section to edit.
          </p>

          <div className="mb-8">
            <AdPreview adData={adData} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {Object.entries(adData).map(([key, value]) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
                      onClick={() => onEdit(key)}
                    >
                      <h3 className="text-lg font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {key === 'customImage' ? (
                          value ? 'Image uploaded' : 'No image'
                        ) : typeof value === 'string' || value === null ? (
                          value
                        ) : 'File provided'} {/* This handles File type */}
                      </p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to edit {key}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between mt-12"
          >
            <Button onClick={onPrev} variant="outline" className="px-8 py-3 text-lg">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted}
              className="px-8 py-3 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : isSubmitted ? (
                <>
                  <FaCheck className="mr-2" />
                  Submitted
                </>
              ) : (
                'Submit Ad'
              )}
            </Button>
          </motion.div>

          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 text-center"
              >
                <FaCheck className="inline-block mr-2" />
                Your ad has been successfully submitted!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}