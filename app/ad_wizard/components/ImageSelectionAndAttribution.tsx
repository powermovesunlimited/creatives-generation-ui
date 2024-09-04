import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RelevantImage {
  id: string;
  src: string;
  alt: string;
}

interface ImageSelectionAndAttributionProps {
  image: RelevantImage;
  onSelectLogo: (imageId: string) => void;
  onSelectReference: (imageId: string) => void;
  selectedLogoId: string | null;
  selectedReferenceId: string | null;
}

const ImageSelectionAndAttribution: React.FC<ImageSelectionAndAttributionProps> = ({
  image,
  onSelectLogo,
  onSelectReference,
  selectedLogoId,
  selectedReferenceId,
}) => {
  const [selectedType, setSelectedType] = useState<'logo' | 'reference' | null>(null);

  useEffect(() => {
    if (image.id === selectedLogoId) {
      setSelectedType('logo');
    } else if (image.id === selectedReferenceId) {
      setSelectedType('reference');
    } else {
      setSelectedType(null);
    }
  }, [image.id, selectedLogoId, selectedReferenceId]);

  const handleSelection = (type: 'logo' | 'reference') => {
    if (type === 'logo') {
      onSelectLogo(image.id);
    } else {
      onSelectReference(image.id);
    }
    setSelectedType(type);
  };

  return (
    <div className="flex flex-col items-center p-2 border rounded-lg">
      <img src={image.src} alt={image.alt} className="w-full h-32 object-cover mb-2" />
      <RadioGroup
        className="flex space-x-2"
        value={selectedType || ''}
        onValueChange={(value) => handleSelection(value as 'logo' | 'reference')}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="logo"
            id={`logo-${image.id}`}
            checked={selectedType === 'logo'}
          />
          <Label htmlFor={`logo-${image.id}`}>Logo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="reference"
            id={`reference-${image.id}`}
            checked={selectedType === 'reference'}
          />
          <Label htmlFor={`reference-${image.id}`}>Reference</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ImageSelectionAndAttribution;