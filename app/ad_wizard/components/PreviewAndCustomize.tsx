import React from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEdit } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PreviewAndCustomizeProps {
  adData: {
    headline: string;
    adCopy: string;
    callToAction: string;
    visualTheme: string;
    customImage: File | null;
  };
  updateAdData: (newData: Partial<typeof adData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PreviewAndCustomize({ adData, updateAdData, onNext, onPrev }: PreviewAndCustomizeProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaEye className="mr-2 text-primary" />
            Preview and Customize
          </h2>
          <p className="mb-6 text-muted-foreground">
            Review your ad and make any final adjustments:
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-muted-foreground mb-1">
                Headline
              </label>
              <Input
                id="headline"
                value={adData.headline}
                onChange={(e) => updateAdData({ headline: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="adCopy" className="block text-sm font-medium text-muted-foreground mb-1">
                Ad Copy
              </label>
              <Textarea
                id="adCopy"
                value={adData.adCopy}
                onChange={(e) => updateAdData({ adCopy: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="callToAction" className="block text-sm font-medium text-muted-foreground mb-1">
                Call to Action
              </label>
              <Input
                id="callToAction"
                value={adData.callToAction}
                onChange={(e) => updateAdData({ callToAction: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaEye className="mr-2" />
              Ad Preview
            </h3>
            <div className="space-y-2">
              <p className="font-bold">{adData.headline}</p>
              <p>{adData.adCopy}</p>
              <p className="font-semibold text-primary">{adData.callToAction}</p>
              <p className="text-sm text-muted-foreground">Visual Theme: {adData.visualTheme}</p>
              {adData.customImage && (
                <p className="text-sm text-muted-foreground">Custom Image: {adData.customImage.name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button onClick={onPrev} variant="outline">Back</Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}