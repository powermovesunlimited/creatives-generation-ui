import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}