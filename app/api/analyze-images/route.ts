import { NextResponse } from 'next/server';

function isValidImageUrl(url: string): boolean {
  const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const extension = url.split('.').pop()?.toLowerCase();
  return validExtensions.includes(extension);
}

async function determineImageRelevance(images: any[], businessContext: string, req: Request): Promise<any[]> {
  console.log('Determining image relevance...');
  try {
    const validImages = images.filter(image => isValidImageUrl(image.src));
    console.log(`Filtered ${images.length - validImages.length} invalid images`);

    const response = await fetch(new URL('/api/determine-image-relevance', req.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: validImages, businessContext })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to determine image relevance:', errorText);
      throw new Error(`Failed to determine image relevance: ${errorText}`);
    }

    const { relevantImages } = await response.json();
    console.log('Relevant images:', JSON.stringify(relevantImages, null, 2));
    return relevantImages;
  } catch (error) {
    console.error('Error in determineImageRelevance:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images, businessContext } = body;

    if (!images || !businessContext) {
      return NextResponse.json({ error: 'Missing images or business context' }, { status: 400 });
    }

    console.log('Analyzing images...');
    const relevantImages = await determineImageRelevance(images, businessContext, req);

    return NextResponse.json({ relevantImages });
  } catch (error) {
    console.error('Error in analyze-images:', error);
    // return empty array if an error occurs
    return NextResponse.json({ relevantImages: [] });
  }
}