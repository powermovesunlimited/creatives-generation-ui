import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ChevronRight, RefreshCw, Trash2 } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

type RequestData = {
  headline: string;
  body_text: string;
  additional_description?: string;
  image?: string;
  number_of_variations: number;
  call_to_action_text: string;
  instructional_prompt: string;
  dimensions?: string;
};

type GeneratedImage = {
  id: string;
  type: string;
  data: string;
};

type GeneratedData = {
  generations: GeneratedImage[];
};

type AdGeneration = {
  id: string;
  created_at: string;
  status: string;
  queue_position?: number | null;
  request_data: string;
  generated_data?: GeneratedData;
  error_message?: string;
};

const StatusIcon = ({ status }: { status: string; queuePosition?: number | null }) => {
  if (status.startsWith('Queued')) {
    return <Clock className="text-gray-500" />;
  } else if (status === 'Processing') {
    return <Clock className="text-yellow-500" />;
  } else if (status === 'completed') {
    return <CheckCircle className="text-green-500" />;
  } else if (status === 'Error') {
    return <XCircle className="text-red-500" />;
  }
  return null;
};

interface GalleryItemCardProps {
  generation: AdGeneration;
  gradient: string;
  onRegenerate: (requestData: RequestData) => void;
  onDelete: (id: string) => void;
}

const GalleryItemCard: React.FC<GalleryItemCardProps> = ({ generation, gradient, onRegenerate, onDelete }) => {
  const requestData: RequestData = JSON.parse(generation.request_data);
  const firstImage = generation.generated_data?.generations[0];

  const getStatusColor = (status: string) => {
    if (status.startsWith('Queued')) return 'bg-gray-500';
    if (status === 'Processing') return 'bg-yellow-500';
    if (status === 'completed') return 'bg-green-500';
    if (status === 'Error') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const isProcessing = generation.status === 'Processing';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        id={generation.id}
        className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${gradient}`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <StatusIcon status={generation.status} queuePosition={generation.queue_position} />
            <span className="text-sm font-medium text-muted-foreground">
              {new Date(generation.created_at).toLocaleDateString()}
            </span>
          </div>
          {generation.status === 'completed' && firstImage && (
            <div className="mb-4 relative aspect-video">
              <Image
                src={`data:${firstImage.type};base64,${firstImage.data}`}
                alt={requestData.headline || "Generated Ad Image"}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2 text-foreground line-clamp-2">
            {requestData.headline || "Untitled Ad"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {requestData.body_text.substring(0, 100)}...
          </p>
          <motion.div 
            className="flex items-center space-x-2"
            animate={isProcessing ? { opacity: [1, 0.5, 1] } : {}}
            transition={isProcessing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <div className={`w-3 h-3 rounded-full ${getStatusColor(generation.status)}`}></div>
            <span className="text-sm font-medium capitalize">
              {generation.status}
              {generation.queue_position && ` (Position: ${generation.queue_position})`}
            </span>
          </motion.div>
          {generation.error_message && (
            <p className="text-sm text-red-500 mt-2">{generation.error_message}</p>
          )}
        </CardContent>
        <CardFooter className="bg-background/50 p-4 flex flex-col space-y-2">
          <Link href={`/ad-gallery/${generation.id}/generation`} className="w-full">
            <Button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            className="w-full bg-secondary/90 hover:bg-secondary text-secondary-foreground"
            onClick={() => onRegenerate(requestData)}
          >
            Regenerate
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            className="w-full bg-red-500/90 hover:bg-red-500 text-white"
            onClick={() => onDelete(generation.id)}
          >
            Delete
            <Trash2 className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GalleryItemCard;