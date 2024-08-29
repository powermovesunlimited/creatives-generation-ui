"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return <Clock className="text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="text-green-500" />;
    default:
      return <XCircle className="text-red-500" />;
  }
};

const gradients = [
  'from-blue-100 to-purple-100',
  'from-green-100 to-blue-100',
  'from-yellow-100 to-red-100',
  'from-pink-100 to-blue-100',
  'from-indigo-100 to-purple-100'
];

function AdGalleryContent() {
  const searchParams = useSearchParams();
  const [adGenerations, setAdGenerations] = useState([]);
  const [error, setError] = useState(null);

  const fetchAdGenerations = useCallback(async () => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ad_generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setAdGenerations(prevGenerations => {
          if (JSON.stringify(prevGenerations) !== JSON.stringify(data)) {
            return data || [];
          }
          return prevGenerations;
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  }, []);

  useEffect(() => {
    fetchAdGenerations();
    const interval = setInterval(fetchAdGenerations, 10000);
    return () => clearInterval(interval);
  }, [fetchAdGenerations]);

  useEffect(() => {
    const recordId = searchParams.get('recordId');
    if (recordId) {
      const element = document.getElementById(recordId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams, adGenerations]);

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
      {adGenerations.length === 0 ? (
        <p className="text-center text-muted-foreground">No ad generations found. Start your creative journey!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {adGenerations.map((generation, index) => (
              <motion.div
                key={generation.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  id={generation.id}
                  className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${gradients[index % gradients.length]} ${(generation.status === 'pending' || generation.status === 'processing') ? 'animate-pulse' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <StatusIcon status={generation.status} />
                      <span className="text-sm font-medium text-muted-foreground">
                        {new Date(generation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground line-clamp-2">
                      {generation.request_data?.headline || "Untitled Ad"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {generation.request_data?.body_text?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        generation.status === 'pending' || generation.status === 'processing' ? 'bg-yellow-500' : 
                        generation.status === 'completed' ? 'bg-green-500' : 
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{generation.status}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-background/50 p-4">
                    <Link href={`/ad-gallery/${generation.id}/generation`} className="w-full">
                      <Button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <motion.div 
        className="mt-12 text-center"
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
    </div>
  );
}

export default function AdGallery() {
  return <AdGalleryContent />;
}