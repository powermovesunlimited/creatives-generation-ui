import React, { useState } from 'react';
import { FaBullhorn, FaEdit, FaSync } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
interface AdData {
  businessInfo: any | null;
  businessType: string;
  headline: string;
  adCopy: string;
}

interface SuggestedOptionsSectionProps {
  options: {
    businessTypes: string[];
    headlines: string[];
    adCopies: string[];
  };
  isLoading: boolean;
  onUpdate: (newData: Partial<AdData>) => void;
  onRegenerate: () => void;
  currentSelections: Partial<AdData>;
}


const LoadingSpinner: React.FC = () => (
  <motion.div
    className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const SuggestedOptionsSection: React.FC<SuggestedOptionsSectionProps> = ({
  options,
  isLoading,
  onUpdate,
  onRegenerate,
  currentSelections,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [customInputs, setCustomInputs] = useState({
    businessType: '',
    headline: '',
    adCopy: '',
  });

  const handleCustomInputChange = (field: keyof typeof customInputs, value: string) => {
    setCustomInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomInputSubmit = (field: keyof typeof customInputs) => {
    onUpdate({ [field]: customInputs[field] });
    setExpandedSection(null);
  };
  

  const renderOptions = (optionType: 'businessTypes' | 'headlines' | 'adCopies', singularType: keyof AdData) => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold capitalize">{optionType.replace(/([A-Z])/g, ' $1').trim()}</h3>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedSection(expandedSection === singularType ? null : singularType)}
                  >
                    <FaEdit />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit {singularType}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {expandedSection === singularType ? (
          <div className="mt-2">
            {singularType === 'adCopy' ? (
              <Textarea
                value={customInputs[singularType]}
                onChange={(e) => handleCustomInputChange(singularType, e.target.value)}
                placeholder={`Enter custom ${singularType}`}
                className="mb-2"
              />
            ) : (
              <Input
                value={customInputs[singularType]}
                onChange={(e) => handleCustomInputChange(singularType, e.target.value)}
                placeholder={`Enter custom ${singularType}`}
                className="mb-2"
              />
            )}
            <Button onClick={() => handleCustomInputSubmit(singularType)}>Submit</Button>
          </div>
        ) : (
          <RadioGroup
            value={currentSelections[singularType] as string}
            onValueChange={(value) => onUpdate({ [singularType]: value })}
            className="space-y-2"
          >
            {options[optionType].map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <RadioGroupItem value={option} id={`${singularType}-${index}`} />
                <Label htmlFor={`${singularType}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    );
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FaBullhorn className="mr-2 text-red-500" />
          Suggested Options
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onRegenerate} disabled={isLoading}>
                <FaSync className="mr-2" />
                Regenerate All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Regenerate all suggestions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {renderOptions('businessTypes', 'businessType')}
            {renderOptions('headlines', 'headline')}
            {renderOptions('adCopies', 'adCopy')}
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default SuggestedOptionsSection;