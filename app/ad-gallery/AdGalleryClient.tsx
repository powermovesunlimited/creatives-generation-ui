"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import GalleryItemCard from './GalleryItemCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Define the types based on the ConversionAdRequest model and updated Supabase structure
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  request_data: string; // This is a JSON string
  generated_data?: GeneratedData;
};

const gradients = [
  'from-blue-100 to-purple-100',
  'from-green-100 to-blue-100',
  'from-yellow-100 to-red-100',
  'from-pink-100 to-blue-100',
  'from-indigo-100 to-purple-100'
];

const shimmerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse" as const,
    }
  }
};

const ShimmerEffect = () => (
  <motion.div 
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          when: "beforeChildren",
          staggerChildren: 0.1,
        },
      },
    }}
  >
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={index}
        className="bg-gray-200 rounded-lg h-64"
        variants={shimmerVariants}
      ></motion.div>
    ))}
  </motion.div>
);

export default function AdGalleryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [adGenerations, setAdGenerations] = useState<AdGeneration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 9; // Number of items per page

  const fetchAdGenerations = useCallback(async (pageNumber: number) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('ad_generations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE - 1);

      if (error) {
        setError(error.message);
      } else {
        setAdGenerations(prevGenerations => 
          pageNumber === 0 ? data as AdGeneration[] : [...prevGenerations, ...(data as AdGeneration[])]
        );
        setHasMore((count || 0) > (pageNumber + 1) * PAGE_SIZE);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdGenerations(page);

    // Set up real-time subscription
    const channel = supabase
      .channel('ad_generations_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ad_generations' 
        }, 
        (payload) => {
          fetchAdGenerations(0);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAdGenerations, page]);

  useEffect(() => {
    const recordId = searchParams.get('recordId');
    if (recordId) {
      const element = document.getElementById(recordId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams, adGenerations]);

  const handleRegenerate = (requestData: RequestData) => {
    const queryString = new URLSearchParams(
      Object.entries(requestData).map(([key, value]) => [key, value.toString()])
    ).toString();
    router.push(`/generate-ad?${queryString}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ad_generations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove the deleted item from the state
      setAdGenerations(prevGenerations => prevGenerations.filter(gen => gen.id !== id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete the ad generation');
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-background to-muted min-h-screen">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-foreground text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Creative Ad Journey
      </motion.h1>

      {/* Create New Ad button - now centered above the grid */}
      <motion.div 
        className="mb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Link href="/generate-ad">
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            Create New Ad
          </Button>
        </Link>
      </motion.div>

      {isLoading && page === 0 ? (
        <ShimmerEffect />
      ) : adGenerations.length === 0 ? (
        <p className="text-center text-muted-foreground">No ad generations found. Start your creative journey!</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {adGenerations.map((generation, index) => (
                <GalleryItemCard
                  key={generation.id}
                  generation={generation}
                  gradient={gradients[index % gradients.length]}
                  onRegenerate={handleRegenerate}
                  onDelete={openDeleteDialog}
                />
              ))}
            </AnimatePresence>
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <Button onClick={loadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

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
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}