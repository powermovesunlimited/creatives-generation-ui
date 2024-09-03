import { NextResponse } from 'next/server';
import axios from 'axios';

const AZURE_CRAWL_SERVICE_URL = 'https://crawl4ai-app.azurewebsites.net/crawl';
const MAX_RETRIES = 4;

async function makeRequest(payload: any, retryCount = 0): Promise<any> {
  try {
    console.log('Making request to Azure Crawl Service with payload:', JSON.stringify(payload, null, 2));
    const response = await axios.post(AZURE_CRAWL_SERVICE_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Azure Crawl Service response:', JSON.stringify(response.data).substring(0, 1000));
    return response.data;
  } catch (error) {
    console.error('Error in makeRequest:', error);
    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount + 1} of ${MAX_RETRIES}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return makeRequest(payload, retryCount + 1);
    } else {
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, extractionStrategy } = body;

    if (!url || !extractionStrategy) {
      return NextResponse.json({ error: 'Missing URL or extraction strategy' }, { status: 400 });
    }

    const payload = {
      urls: [url],
      chunking_strategy: 'RegexChunking',
      include_raw_html: false,
      bypass_cache: true,
      extract_blocks: true,
      word_count_threshold: 5,
      verbose: true,
      ...extractionStrategy
    };

    console.log('Crawling website...');
    const response = await makeRequest(payload);

    if (response.results && response.results.length > 0 && response.results[0].extracted_content) {
      const markdownContent = response.results[0].markdown;
      const scraped_media_content = response.results[0].media;
      const images = scraped_media_content.images;

      return NextResponse.json({ markdownContent, images });
    } else {
      console.error('No valid extracted content found in the response');
      return NextResponse.json({ error: 'No valid extracted content found in the response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in crawl-website:', error);
    return NextResponse.json({ error: 'An error occurred while crawling the website', details: error.message }, { status: 500 });
  }
}