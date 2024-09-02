import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, ChevronRight, RefreshCw, Trash2, Loader2, AlignLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  queue_position?: number;
  request_data: string;
  generated_data?: GeneratedData;
};

const StatusIcon = ({ status }: { status: AdGeneration['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock className="text-yellow-500" />;
    case 'queued':
      return <AlignLeft className="text-gray-500" />;
    case 'processing':
      return <Loader2 className="text-yellow-500 animate-spin" />;
    case 'completed':
      return <CheckCircle className="text-green-500" />;
    case 'failed':
      return <XCircle className="text-red-500" />;
    default:
      return null;
  }
};

type GalleryItemProps = {
  generation: AdGeneration;
  gradient: string;
  onRegenerate: (requestData: RequestData) => void;
  onDelete: (id: string) => void;
};

export default function GalleryItem({ generation, gradient, onRegenerate, onDelete }: GalleryItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const requestData: RequestData = JSON.parse(generation.request_data);
  const firstImage = generation.generated_data?.generations[0];

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);

  const getStatusColor = (status: AdGeneration['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'queued':
        return 'bg-gray-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusAnimation = (status: AdGeneration['status']) => {
    switch (status) {
      case 'pending':
        return 'animate-pulse';
      case 'queued':
        return 'animate-bounce';
      case 'processing':
        return 'animate-pulse';
      default:
        return '';
    }
  };

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
            <div className={`${getStatusAnimation(generation.status)}`} style={{ animationDuration: '3s' }}>
              <StatusIcon status={generation.status} />
            </div>
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
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(generation.status)}`}></div>
            <span className="text-sm font-medium capitalize">
              {generation.status}
              {generation.status === 'queued' && generation.queue_position !== undefined && ` (Position: ${generation.queue_position})`}
            </span>
          </div>
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
            onClick={openDeleteDialog}
          >
            Delete
            <Trash2 className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ad generation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => onDelete(generation.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}