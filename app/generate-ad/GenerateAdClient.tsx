"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateAdClient() {
  const [formData, setFormData] = useState({
    headline: "",
    body_text: "",
    additional_description: "",
    image: "Generate with tool",
    call_to_action_text: "",
    instructional_prompt: "",
    number_of_variations: "1",
    dimensions: "1080x1080",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryString = new URLSearchParams(formData).toString();
    router.push(`/ad-results?${queryString}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex flex-1 flex-col gap-4">
        <Link href="/overview" className="text-sm w-fit">
          <Button variant="outline" className="flex items-center gap-2 hover:bg-gray-100 transition-colors">
            <FaArrowLeft />
            Go Back
          </Button>
        </Link>
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center text-blue-700 text-2xl">
              <FaMagic className="mr-2" />
              Generate Ad Creative
            </CardTitle>
            <CardDescription className="text-gray-600">
              Provide information about your ad to generate creative variations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="headline" className="font-medium text-gray-700">Headline</label>
                  <Input
                    id="headline"
                    name="headline"
                    placeholder="Enter your ad headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="body_text" className="font-medium text-gray-700">Body Text</label>
                  <Textarea
                    id="body_text"
                    name="body_text"
                    placeholder="Enter the main text for your ad"
                    value={formData.body_text}
                    onChange={handleInputChange}
                    className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="additional_description" className="font-medium text-gray-700">Additional Description</label>
                  <Textarea
                    id="additional_description"
                    name="additional_description"
                    placeholder="Any additional details or context"
                    value={formData.additional_description}
                    onChange={handleInputChange}
                    className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="call_to_action_text" className="font-medium text-gray-700">Call to Action Text</label>
                  <Input
                    id="call_to_action_text"
                    name="call_to_action_text"
                    placeholder="e.g., 'Shop Now', 'Learn More'"
                    value={formData.call_to_action_text}
                    onChange={handleInputChange}
                    className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="instructional_prompt" className="font-medium text-gray-700">Instructional Prompt</label>
                  <Textarea
                    id="instructional_prompt"
                    name="instructional_prompt"
                    placeholder="Any specific instructions for the AI"
                    value={formData.instructional_prompt}
                    onChange={handleInputChange}
                    className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="number_of_variations" className="font-medium text-gray-700">Number of Variations</label>
                  <Select
                    onValueChange={(value) => handleSelectChange("number_of_variations", value)}
                    value={formData.number_of_variations}
                  >
                    <SelectTrigger id="number_of_variations" className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow">
                      <SelectValue placeholder="Select number of variations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="dimensions" className="font-medium text-gray-700">Dimensions</label>
                  <Select
                    onValueChange={(value) => handleSelectChange("dimensions", value)}
                    value={formData.dimensions}
                  >
                    <SelectTrigger id="dimensions" className="border-2 focus:ring-2 focus:ring-blue-500 transition-shadow">
                      <SelectValue placeholder="Select ad dimensions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200x628">1200x628 (Facebook/LinkedIn)</SelectItem>
                      <SelectItem value="1080x1080">1080x1080 (Instagram)</SelectItem>
                      <SelectItem value="1080x1920">1080x1920 (Instagram Story)</SelectItem>
                      <SelectItem value="1200x900">1200x900 (Twitter)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  Generate Ad Creatives
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}