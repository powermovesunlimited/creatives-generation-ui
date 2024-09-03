import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaRocket, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";


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

interface ScrapedData {
  business_name: string;
  business_type: string;
  description: string;
  key_products_or_services: string[];
  relevantImages: RelevantImage[];
}

interface WelcomeScreenProps {
  adData: {
    url: string;
    businessInfo: {
      business_name: string;
      business_type: string;
      description: string;
      key_products_or_services: string[];
    } | null;
    relevantImages: RelevantImage[];
  };
  updateAdData: (newData: Partial<typeof adData>) => void;
  onNext: () => void;
}

export default function WelcomeScreen({ adData, updateAdData, onNext }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [partialResults, setPartialResults] = useState<Partial<ScrapedData>>({});

  const updateProgress = (newProgress: number, message: string) => {
    setProgress(newProgress);
    setStatusMessage(message);
    console.log(`Progress: ${newProgress}%, Message: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setPartialResults({});
    updateProgress(0, 'Initializing scraping process...');

    try {
      // Step 1: Generate extraction strategy
      updateProgress(10, 'Generating extraction strategy...');
      const extractionStrategyResponse = await fetch('/api/generate-extraction-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: adData.url }),
      });
      const extractionStrategyData = await extractionStrategyResponse.json();
      if (extractionStrategyData.error) throw new Error(extractionStrategyData.error);
      const { extractionStrategy } = extractionStrategyData;
      setPartialResults(prev => ({ ...prev, extractionStrategy: 'Generated' }));

      // Step 2: Crawl website
      updateProgress(30, 'Crawling website...');
      const crawlResponse = await fetch('/api/crawl-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: adData.url, extractionStrategy }),
      });
      const crawlData = await crawlResponse.json();
      if (crawlData.error) throw new Error(crawlData.error);
      const { markdownContent, images } = crawlData;
      setPartialResults(prev => ({ ...prev, crawledContent: 'Obtained', imageCount: images.length }));

      // Step 3: Interpret data
      updateProgress(60, 'Interpreting scraped data...');
      const interpretResponse = await fetch('/api/interpret-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent }),
      });
      const interpretData = await interpretResponse.json();
      if (interpretData.error) throw new Error(interpretData.error);
      const { interpretedData } = interpretData;
      setPartialResults(prev => ({ ...prev, ...interpretedData }));

      // Step 4: Analyze images
      updateProgress(80, 'Analyzing images...');
      const analyzeImagesResponse = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, businessContext: interpretedData.description }),
      });
      const analyzeImagesData = await analyzeImagesResponse.json();
      if (analyzeImagesData.error) throw new Error(analyzeImagesData.error);
      const { relevantImages } = analyzeImagesData;
      setPartialResults(prev => ({ ...prev, relevantImages }));

      // Update adData with the final results
      updateAdData({
        businessInfo: {
          business_name: interpretedData.business_name,
          business_type: interpretedData.business_type,
          description: interpretedData.description,
          key_products_or_services: interpretedData.key_products_or_services,
        },
        relevantImages,
      });

      updateProgress(100, 'Scraping complete!');
      onNext();
    } catch (error) {
      console.error('Error processing website:', error);
      setError(`An error occurred while processing the website: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text"
          >
            Welcome to Ad Wizard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 text-gray-600"
          >
            Enter your website URL and let our magic begin!
          </motion.p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                type="url"
                placeholder="https://www.example.com"
                value={adData.url}
                onChange={(e) => updateAdData({ url: e.target.value })}
                required
                className="w-full text-lg py-3 px-4 rounded-lg shadow-md focus:ring-2 focus:ring-purple-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaRocket className="mr-2" />
                  </motion.div>
                ) : (
                  <FaMagic className="mr-2" />
                )}
                {isLoading ? 'Casting Spells...' : 'Start the Magic'}
              </Button>
            </motion.div>
          </form>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-red-500 mt-4 text-center flex items-center justify-center"
              >
                <FaExclamationTriangle className="mr-2" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Progress value={progress} className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </Progress>
              <p className="text-center mt-2 text-gray-600">{statusMessage}</p>
            </motion.div>
          )}
          <AnimatePresence>
            {Object.keys(partialResults).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold mb-4 text-purple-600">Magic in Progress:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(partialResults).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center"
                    >
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                      <span className="ml-2">{Array.isArray(value) ? value.join(', ') : value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {adData.businessInfo && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold mb-4 text-indigo-600">Magic Complete!</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(adData.businessInfo).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center"
                    >
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                      <span className="ml-2">{Array.isArray(value) ? value.join(', ') : value || 'N/A'}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center"
                  >
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="font-medium">Relevant Images:</span>
                    <span className="ml-2">{adData.relevantImages?.length || 0}</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}