"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { FaSearch, FaDownload, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const ShimmerEffect = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-muted rounded-lg h-80 animate-pulse"></div>
    ))}
  </div>
);

export default function AdGenerationView() {
  const { id } = useParams();
  const [adGeneration, setAdGeneration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAdGeneration() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('ad_generations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setAdGeneration(data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }

    fetchAdGeneration();
  }, [id]);

  const handleDownload = (adData) => {
    const link = document.createElement('a');
    link.href = `data:${adData.type};base64,${adData.data}`;
    link.download = `ad_${adData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatedAds = adGeneration?.generated_data?.generations || [];

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Button 
          onClick={() => router.push('/ad-gallery')}
          variant="outline"
          className="mb-4 hover:bg-primary/10"
        >
          <FaArrowLeft className="mr-2" />
          Back to Gallery
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Ad Generation Magic</h1>
        {adGeneration && (
          <div className="text-muted-foreground">
            <p>Created: {new Date(adGeneration.created_at).toLocaleString()}</p>
            <p>Status: <span className="font-semibold text-primary">{adGeneration.status}</span></p>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <ShimmerEffect />
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : adGeneration?.status === 'completed' && generatedAds.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {generatedAds.map((adData, index) => (
            <motion.div
              key={adData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="relative group">
                    <Image
                      src={`data:${adData.type};base64,${adData.data}`}
                      alt={`Generated ad ${adData.id}`}
                      width={300}
                      height={300}
                      className="rounded-md shadow-sm w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                      <Button 
                        onClick={() => setSelectedImage(adData)}
                        variant="secondary"
                        className="mr-2"
                      >
                        <FaSearch className="mr-2" />
                        View
                      </Button>
                      <Button 
                        onClick={() => handleDownload(adData)}
                        variant="secondary"
                      >
                        <FaDownload className="mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-muted-foreground">No generated ad data available</p>
      )}

      <AnimatePresence>
        {selectedImage && (
          <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-3xl">
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <span className="sr-only">Close</span>
              </DialogClose>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={`data:${selectedImage.type};base64,${selectedImage.data}`}
                  alt="Selected ad image"
                  width={1080}
                  height={1080}
                  className="rounded-md shadow-md"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}