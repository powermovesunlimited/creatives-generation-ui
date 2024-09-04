import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      console.error('Missing URL in request');
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    console.log('Generating extraction strategy for URL:', url);
    
    // Get the host from the incoming request
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const extractionStrategyResponse = await fetch(`${protocol}://${host}/api/generate-crawl-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!extractionStrategyResponse.ok) {
      const errorText = await extractionStrategyResponse.text();
      console.error('Failed to generate extraction strategy:', errorText);
      return NextResponse.json({ error: 'Failed to generate extraction strategy', details: errorText }, { status: 500 });
    }

    const extractionStrategy = await extractionStrategyResponse.json();
    console.log('Extraction strategy:', JSON.stringify(extractionStrategy, null, 2));

    return NextResponse.json({ extractionStrategy });
  } catch (error) {
    console.error('Error in generate-extraction-strategy:', error);
    return NextResponse.json({ error: 'An error occurred while generating the extraction strategy', details: error.message }, { status: 500 });
  }
}