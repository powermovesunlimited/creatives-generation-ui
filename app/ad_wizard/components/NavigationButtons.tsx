import React from 'react';
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onPrev, onNext, isNextDisabled }) => {
  return (
    <div className="flex justify-between mt-8">
      <Button onClick={onPrev} variant="outline" className="px-8 py-3 text-lg">
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
      >
        Next
      </Button>
    </div>
  );
};

export default NavigationButtons;