import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    console.log('Generating extraction strategy for URL:', url);
    const extractionStrategyResponse = await fetch(new URL('/api/generate-crawl-request', req.url), {
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