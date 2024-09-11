"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import PublicGalleryItemCard from './PublicGalleryItemCard';
import { PublicGalleryItemDetails } from './PublicGalleryItemDetails';
import {
    ShimmerEffect,
    ErrorDisplay,
    NoGenerationsFound,
    LoadMoreButton
} from './SharedGalleryComponents';
import { AdGeneration } from '@/app/ad-gallery/AdGalleryClient';
import Marquee from 'react-fast-marquee';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const ITEMS_PER_PAGE = 24;
const ITEMS_PER_ROW = 6;
const ROWS = 3;

export default function PublicAdGalleryClient() {
    const supabase = createClientComponentClient<Database>();
    const [adGenerations, setAdGenerations] = useState<AdGeneration[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedItem, setSelectedItem] = useState<AdGeneration | null>(null);

    const fetchPublicAdGenerations = useCallback(async (pageNumber: number, retryCount = 0) => {
        setError(null);
        setIsLoading(true);
        try {
            const { data, error, count } = await supabase
                .from('ad_generations_test')
                .select('id, created_at, status, queue_position, request_data, generated_data, error_message, user_id', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(pageNumber * ITEMS_PER_PAGE, (pageNumber + 1) * ITEMS_PER_PAGE - 1);

            if (error) {
                console.error('Supabase query error:', error);
                throw new Error(`Failed to fetch public ad generations: ${error.message}`);
            }

            if (!data) {
                throw new Error('No data returned from Supabase');
            }

            const processedData = data.map(item => ({
                ...item,
                request_data: typeof item.request_data === 'string' ? JSON.parse(item.request_data) : item.request_data,
                generated_data: typeof item.generated_data === 'string' ? JSON.parse(item.generated_data) : item.generated_data
            }));

            setAdGenerations(prevGenerations =>
                pageNumber === 0 ? processedData as AdGeneration[] : [...prevGenerations, ...(processedData as AdGeneration[])]
            );
            setHasMore((count || 0) > (pageNumber + 1) * ITEMS_PER_PAGE);
        } catch (err) {
            console.error('Error in fetchPublicAdGenerations:', err);
            if (err instanceof Error && err.message.includes('Could not query the database for the schema cache') && retryCount < MAX_RETRIES) {
                console.log(`Retrying fetchPublicAdGenerations (Attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
                setTimeout(() => fetchPublicAdGenerations(pageNumber, retryCount + 1), RETRY_DELAY);
                return;
            }
            if (err instanceof Error) {
                setError(`Failed to load public ad generations: ${err.message}`);
            } else {
                setError('An unexpected error occurred while fetching public ad generations');
            }
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchPublicAdGenerations(page);
    }, [fetchPublicAdGenerations, page]);

    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleItemClick = (item: AdGeneration) => {
        setSelectedItem(item);
    };

    const handleCloseDetails = () => {
        setSelectedItem(null);
    };

    if (error) {
        return <ErrorDisplay error={error} onRetry={() => fetchPublicAdGenerations(0)} />;
    }

    const renderMarqueeRow = (generations: AdGeneration[], rowIndex: number) => (
        <div className="marquee-container">
            <Marquee
                key={rowIndex}
                direction={rowIndex % 2 === 0 ? 'left' : 'right'}
                speed={20}
                gradient={false}
                className={'mb-4 no-scrollbar p-8'}
                pauseOnHover={true}
            >
                {generations.map((generation) => (
                    <div key={generation.id} className="mx-2" style={{ width: '350px' }}>
                        <PublicGalleryItemCard
                            generations={generation?.generated_data?.generations || []}
                            requestData={generation.request_data}
                            id={generation.id}
                            created_at={generation.created_at}
                            onClick={() => handleItemClick(generation)}
                        />
                    </div>
                ))}
            </Marquee>
        </div>
    );

    const renderMarqueeGrid = () => {
        const rows = [];
        for (let i = 0; i < adGenerations.length; i += ITEMS_PER_ROW) {
            const rowGenerations = adGenerations.slice(i, i + ITEMS_PER_ROW);
            rows.push(renderMarqueeRow(rowGenerations, i / ITEMS_PER_ROW));
        }
        return rows.slice(0, ROWS);
    };

    return (
        <>
            <style jsx global>{`
                .marquee-container {
                    overflow: hidden;
                }
                .no-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="container mx-auto bg-white overflow-hidden">
                {isLoading && page === 0 ? (
                    <ShimmerEffect />
                ) : adGenerations.length === 0 ? (
                    <NoGenerationsFound />
                ) : (
                    <>
                        <div className="overflow-hidden">
                            {renderMarqueeGrid()}
                        </div>
                    </>
                )}
            </div>
            {selectedItem && (
                <PublicGalleryItemDetails
                    id={selectedItem.id}
                    requestData={selectedItem.request_data}
                    generations={selectedItem.generated_data?.generations || []}
                    created_at={selectedItem.created_at}
                    onClose={handleCloseDetails}
                />
            )}
        </>
    );
}