import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SharedGalleryItem, SharedGalleryItemProps } from './SharedGalleryItemComponents';

interface ModernGalleryItemCardProps extends SharedGalleryItemProps {
  onRegenerate: (requestData: RequestData) => void;
  onDelete: (id: string) => void;
}

const ModernGalleryItemCard: React.FC<ModernGalleryItemCardProps> = (props) => {
  const { onRegenerate, onDelete, requestData, id, ...sharedProps } = props;

  return (
    <SharedGalleryItem {...sharedProps} requestData={requestData} id={id}>
      <div className="flex justify-between mt-4">
        <Link href={`/ad-gallery/${id}/generation`}>
          <Button variant="outline">View All</Button>
        </Link>
        <Button variant="secondary" onClick={() => onRegenerate(requestData)}>Re-generate</Button>
        <Button variant="destructive" onClick={() => onDelete(id)}>Delete</Button>
      </div>
    </SharedGalleryItem>
  );
};

export default ModernGalleryItemCard;