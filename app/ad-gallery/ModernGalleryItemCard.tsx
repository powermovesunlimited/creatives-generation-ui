import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SharedGalleryItem, SharedGalleryItemProps } from './SharedGalleryItemComponents';
import { useRouter } from 'next/navigation';

interface ModernGalleryItemCardProps extends SharedGalleryItemProps {
  onRegenerate: (requestData: RequestData) => void;
  onDelete: (id: string) => void;
}

const ModernGalleryItemCard: React.FC<ModernGalleryItemCardProps> = (props) => {
  const { onRegenerate, onDelete, requestData, id, ...sharedProps } = props;
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/ad-gallery/${id}/generation`);
  };

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <SharedGalleryItem {...sharedProps} requestData={requestData} id={id}>
        <div className="flex justify-between mt-4">
          <Button 
            variant="secondary" 
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(requestData);
            }}
          >
            Re-generate
          </Button>
          <Button 
            variant="destructive" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            Delete
          </Button>
        </div>
      </SharedGalleryItem>
    </div>
  );
};

export default ModernGalleryItemCard;