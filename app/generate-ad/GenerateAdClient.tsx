"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaMagic, FaRobot, FaPencilAlt, FaArrowRight } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleAdSubmission, RequestData } from "./handleAdSubmission";
import { EmailPromptDialog } from "@/components/EmailPromptDialog";
import { generateAIContent } from "./generateAIContent";

const businessTypes = [
  "Restaurant", "Real Estate", "Fitness", "E-commerce", "Technology",
  "Healthcare", "Education", "Travel", "Beauty", "Finance",
];

export default function GenerateAdClient() {
  const [formData, setFormData] = useState<RequestData>({
    headline: "",
    body_text: "",
    additional_description: "",
    image: "Generate with tool",
    call_to_action_text: "",
    instructional_prompt: "",
    number_of_variations: 1,
    dimensions: "1080x1080",
  });
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paramsData: Partial<RequestData> = {};
    searchParams.forEach((value, key) => {
      if (key in formData) {
        if (key === "number_of_variations") {
          paramsData[key as keyof RequestData] = parseInt(value, 10) as any;
        } else {
          paramsData[key as keyof RequestData] = value as any;
        }
      }
    });
    setFormData((prevData) => ({ ...prevData, ...paramsData }));
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: keyof RequestData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "number_of_variations" ? parseInt(value, 10) : value,
    }));
  };

  const handleGenerateAIContent = async () => {
    setIsGenerating(true);
    setAiError('');
    try {
      const generatedContent = await generateAIContent(selectedBusinessType);
      setFormData((prevData) => ({
        ...prevData,
        ...generatedContent,
      }));
    } catch (error) {
      console.error('Error generating AI content:', error);
      setAiError('Failed to generate AI content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.instructional_prompt) {
      alert("Ad Design Instructions are mandatory. Please provide instructions for the ad design.");
      return;
    }
    console.log("Submitting form data:", formData);
    await handleAdSubmission(formData, router, setShowEmailPrompt);
  };

  const handleUseWizard = () => {
    router.push('/ad_wizard');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <h2 className="text-3xl font-bold mb-4">AI-Powered Ad Creator</h2>
          <p className="mb-6">Create stunning ads with the power of AI or use our step-by-step wizard for a guided experience.</p>
          <Button 
            onClick={handleUseWizard}
            className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-lg"
          >
            Use Ad Wizard <FaMagic className="ml-2" />
          </Button>
          <div className="mt-4 text-sm">
            <h3 className="font-semibold mb-2">How our AI Wizard improves your ad creation:</h3>
            <ul className="list-disc list-inside">
              <li>Analyzes your website to understand your business</li>
              <li>Generates tailored ad content suggestions</li>
              <li>Recommends effective call-to-action phrases</li>
              <li>Suggests visual styles that match your brand</li>
              <li>Guides you through each step of the process</li>
            </ul>
          </div>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="ai" className="py-4 text-lg font-semibold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <FaRobot className="mr-2 inline" /> AI-Assisted
            </TabsTrigger>
            <TabsTrigger value="custom" className="py-4 text-lg font-semibold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <FaPencilAlt className="mr-2 inline" /> Custom Design
            </TabsTrigger>
          </TabsList>

          <div className="p-6 bg-white">
            <TabsContent value="ai">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Business Type</label>
                <Select
                  onValueChange={(value) => setSelectedBusinessType(value)}
                  value={selectedBusinessType}
                >
                  <SelectTrigger className="w-full border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder="Choose your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerateAIContent}
                disabled={!selectedBusinessType || isGenerating}
                className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                {isGenerating ? (
                  <>Generating... <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="ml-2"><FaRobot /></motion.div></>
                ) : (
                  <>Generate AI Content <FaMagic className="ml-2" /></>
                )}
              </Button>
              {aiError && <p className="text-red-500 mb-4">{aiError}</p>}
            </TabsContent>

            <TabsContent value="custom">
              <p className="text-gray-600 mb-6">
                Unleash your creativity! Customize your ad content below or switch to the AI-assisted tab for quick inspiration.
              </p>
            </TabsContent>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <Input
                  name="headline"
                  placeholder="Enter your captivating headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  className="text-xl font-bold border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Textarea
                  name="body_text"
                  placeholder="Craft your compelling ad copy"
                  value={formData.body_text}
                  onChange={handleInputChange}
                  className="min-h-[120px] border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Input
                  name="call_to_action_text"
                  placeholder="Enter a strong call-to-action"
                  value={formData.call_to_action_text}
                  onChange={handleInputChange}
                  className="border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Textarea
                  name="additional_description"
                  placeholder="Any additional details or context for your ad"
                  value={formData.additional_description}
                  onChange={handleInputChange}
                  className="min-h-[100px] border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Textarea
                  name="instructional_prompt"
                  placeholder="Ad Design Instructions (Mandatory)"
                  value={formData.instructional_prompt}
                  onChange={handleInputChange}
                  className="min-h-[120px] border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Variations</label>
                    <Select
                      onValueChange={(value) => handleSelectChange("number_of_variations", value)}
                      value={formData.number_of_variations.toString()}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Variation</SelectItem>
                        <SelectItem value="3">3 Variations</SelectItem>
                        <SelectItem value="5">5 Variations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                    <Select
                      onValueChange={(value) => handleSelectChange("dimensions", value)}
                      value={formData.dimensions}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080x1080">1080x1080 (Instagram)</SelectItem>
                        <SelectItem value="1200x628">1200x628 (Facebook)</SelectItem>
                        <SelectItem value="1024x512">1024x512 (Twitter)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all duration-300 text-lg flex items-center justify-center"
                >
                  Generate Your Ad Creatives <FaArrowRight className="ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </Tabs>
      </CardContent>
      <EmailPromptDialog
        isOpen={showEmailPrompt}
        onClose={() => setShowEmailPrompt(false)}
        onEmailSubmit={() => {
          setShowEmailPrompt(false);
          handleAdSubmission(formData, router, setShowEmailPrompt);
        }}
      />
    </Card>
  );
}