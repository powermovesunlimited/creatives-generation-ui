import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaSpinner, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { handleAdSubmission } from "@/app/generate-ad/handleAdSubmission";
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
  updateAdData: (newData: Partial<typeof adData>) => void;
}

const AdPreview: React.FC<{ adData: FinalReviewProps['adData']; dimensions: string }> = ({ adData, dimensions }) => {
  const [width, height] = dimensions.split('x').map(Number);
  const aspectRatio = width / height;

  return (
    <div 
      className="relative w-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg shadow-lg overflow-hidden"
      style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
    >
      {adData.customImage && (
        <img
          src={URL.createObjectURL(adData.customImage)}
          alt="Custom background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
      )}
      <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
        <h3 className="text-3xl font-bold mb-4 text-gray-800">{adData.headline}</h3>
        <p className="text-lg mb-6 text-gray-700">{adData.adCopy}</p>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200">
          {adData.callToAction}
        </button>
      </div>
      <div className="absolute bottom-2 right-2 text-sm text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        Theme: {adData.visualTheme}
      </div>
    </div>
  );
};

export default function FinalReview({ adData, onPrev, updateAdData }: FinalReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'visual' | 'text'>('visual');
  const [dimensions, setDimensions] = useState('1200x628');
  const [numberOfVariations, setNumberOfVariations] = useState(1);
  const [instructionalPrompt, setInstructionalPrompt] = useState(`Generate an ad with a ${adData.visualTheme} theme.`);
  const router = useRouter();

  useEffect(() => {
    setInstructionalPrompt(`Generate an ad with a ${adData.visualTheme} theme.`);
  }, [adData.visualTheme]);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);  // Clear any previous errors
    try {
      const requestData = {
        headline: adData.headline,
        body_text: adData.adCopy,
        call_to_action_text: adData.callToAction,
        instructional_prompt: instructionalPrompt,
        number_of_variations: numberOfVariations,
        dimensions: dimensions,
      };

      await handleAdSubmission(requestData, router, setShowEmailPrompt);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting ad:', error);
      setError('Failed to submit ad. Please try again.');  // Set error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleEdit = (field: keyof typeof adData, value: string) => {
    updateAdData({ [field]: value });
  };

  const handleDimensionsChange = (value: string) => {
    setDimensions(value);
    if (previewMode !== 'visual') {
      setPreviewMode('visual');
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <CardContent className="p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
        >
          Final Review
        </motion.h1>
  
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaCheck className="mr-2 text-green-500" />
              Ad Preview
            </h2>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={toggleEditMode} variant="outline" size="sm">
                      <FaEdit className="mr-2" />
                      {isEditing ? 'View' : 'Edit'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isEditing ? 'Switch to view mode' : 'Edit your ad'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setPreviewMode(previewMode === 'visual' ? 'text' : 'visual')}
                      variant="outline"
                      size="sm"
                    >
                      {previewMode === 'visual' ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                      {previewMode === 'visual' ? 'Text View' : 'Visual View'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch between visual and text preview</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
  
          <AnimatePresence mode="wait">
            <motion.div
              key={previewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {previewMode === 'visual' ? (
                <AdPreview adData={adData} dimensions={dimensions} />
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="space-y-4">
                    <Input
                      value={adData.headline}
                      onChange={(e) => handleEdit('headline', e.target.value)}
                      placeholder="Headline"
                      disabled={!isEditing}
                    />
                    <Textarea
                      value={adData.adCopy}
                      onChange={(e) => handleEdit('adCopy', e.target.value)}
                      placeholder="Ad Copy"
                      rows={4}
                      disabled={!isEditing}
                    />
                    <Input
                      value={adData.callToAction}
                      onChange={(e) => handleEdit('callToAction', e.target.value)}
                      placeholder="Call to Action"
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-gray-500">Visual Theme: {adData.visualTheme}</p>
                    {adData.customImage && (
                      <p className="text-sm text-gray-500">Custom Image: {adData.customImage.name}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
  
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="dimensions">Ad Dimensions</Label>
              <Select onValueChange={handleDimensionsChange} value={dimensions}>
                <SelectTrigger id="dimensions">
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080x1080">1080x1080 (Instagram)</SelectItem>
                  <SelectItem value="1200x628">1200x628 (Facebook)</SelectItem>
                  <SelectItem value="1024x512">1024x512 (Twitter)</SelectItem>
                </SelectContent>
              </Select>
            </div>
  
            <div>
              <Label htmlFor="variations">Number of Variations</Label>
              <Select onValueChange={(value) => setNumberOfVariations(Number(value))} value={numberOfVariations.toString()}>
                <SelectTrigger id="variations">
                  <SelectValue placeholder="Select number of variations" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div>
              <Label htmlFor="instructionalPrompt">Instructional Prompt</Label>
              <Textarea
                id="instructionalPrompt"
                value={instructionalPrompt}
                onChange={(e) => setInstructionalPrompt(e.target.value)}
                placeholder="Enter instructional prompt"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">This prompt will be used to generate the ad image.</p>
            </div>
          </div>
  
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-between mt-8"
          >
            <Button onClick={onPrev} variant="outline" className="px-8 py-3 text-lg">
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isSubmitted}
              className="px-8 py-3 text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white"
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
  
          {isSubmitted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-green-600 font-semibold"
            >
              Your ad has been successfully submitted!
            </motion.p>
          )}
  
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-red-600 font-semibold"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}