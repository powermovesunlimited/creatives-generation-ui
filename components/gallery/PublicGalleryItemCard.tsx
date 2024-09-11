import React from 'react';
import { SharedGalleryItem, SharedGalleryItemProps } from '@/app/ad-gallery/SharedGalleryItemComponents';

interface PublicGalleryItemCardProps extends Omit<SharedGalleryItemProps, 'status' | 'queue_position' | 'error_message' | 'gradient'> {
    created_at: string;
    onClick?: () => void;
}

const PublicGalleryItemCard: React.FC<PublicGalleryItemCardProps> = (props) => {
    const { created_at, onClick, ...sharedProps } = props;

    const formattedDate = new Date(created_at).toLocaleString();

    return (
        <div className="w-full h-full cursor-pointer" onClick={onClick}>
            <SharedGalleryItem 
                gradient={''} 
                created_at={formattedDate} 
                {...sharedProps} 
                status="completed" 
                queue_position={null} 
                error_message={undefined}
                showStatus={false}
            >
                <div className="mt-2 text-xs text-gray-300">
                    <p>Created: {formattedDate}</p>
                </div>
            </SharedGalleryItem>
        </div>
    );
};

export default PublicGalleryItemCard;