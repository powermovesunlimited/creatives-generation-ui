import { NextResponse } from 'next/server';
import axios from 'axios';
import OpenAI from 'openai';

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

async function interpretScrapedData(scrapedData: any): Promise<any> {
  console.log('Interpreting scraped data:', JSON.stringify(scrapedData, null, 2));
  const prompt = `
    Analyze the following scraped website data and extract structured information about the business:
    ${JSON.stringify(scrapedData, null, 2)}

    Please provide the following information in a structured format:
    1. Business Name
    2. Business Type
    3. Brief Description (1-2 sentences)
    4. Key Products or Services (list of 3-5 items)

    If any information is not available or unclear, use your best judgment to infer or leave it blank.
  `;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant tasked with interpreting scraped website data and extracting structured business information." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "extract_business_info",
          description: "Extract structured business information from scraped website data",
          parameters: {
            type: "object",
            properties: {
              business_name: { type: "string" },
              business_type: { type: "string" },
              description: { type: "string" },
              key_products_or_services: { 
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["business_name", "business_type", "description", "key_products_or_services"]
          }
        }
      ],
      function_call: { name: "extract_business_info" }
    });

    console.log('OpenAI API response:', JSON.stringify(completion, null, 2));

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.name === "extract_business_info") {
      const interpretedData = JSON.parse(functionCall.arguments);
      console.log('Interpreted data:', JSON.stringify(interpretedData, null, 2));
      return interpretedData;
    } else {
      throw new Error("Unexpected response from OpenAI API");
    }
  } catch (error) {
    console.error('Error in interpretScrapedData:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();


  console.log('Received request to /api/scrape');
  try {
    const body = await req.json();
    console.log('Request body:', body);

    const { url } = body;
    console.log('Received URL:', url);


    // Generate extraction strategy
    console.log('Generating extraction strategy...');
    let extractionStrategy;
    try {
      console.log('Sending request to /api/generate-crawl-request');
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const extractionStrategyResponse = await fetch(`${protocol}://${host}/api/generate-crawl-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      console.log('Response status:', extractionStrategyResponse.status);
      console.log('Response headers:', extractionStrategyResponse.headers);

      if (!extractionStrategyResponse.ok) {
        const errorText = await extractionStrategyResponse.text();
        console.error('Failed to generate extraction strategy:', errorText);
        throw new Error(`Failed to generate extraction strategy: ${errorText}`);
      }

      extractionStrategy = await extractionStrategyResponse.json();
      console.log('Extraction strategy:', JSON.stringify(extractionStrategy, null, 2));
    } catch (error) {
      console.error('Error in generating extraction strategy:', error);
      await writer.close();
      return new NextResponse(stream.readable, {
        headers: { 'Content-Type': 'application/json' },
      });
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

    let response;
    try {
      response = await makeRequest(payload);
    } catch (error) {
      console.error('Error in makeRequest:', error);
      await writer.close();
      return new NextResponse(stream.readable, {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (response.results && response.results.length > 0 && response.results[0].extracted_content) {
      const markdownContent = response.results[0].markdown;
      const scraped_media_content = response.results[0].media;
      const images = scraped_media_content.images;
      
      // Interpret the scraped data using AI
      console.log('Interpreting scraped data...');
      let interpretedData;
      try {``
        interpretedData = await interpretScrapedData(markdownContent);
        console.log('Interpreted data:', JSON.stringify(interpretedData, null, 2));
      } catch (error) {
        console.error('Error interpreting scraped data:', error);
        await writer.close();
        return new NextResponse(stream.readable, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new NextResponse(stream.readable, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      console.error('No valid extracted content found in the response');
      await writer.close();
      return new NextResponse(stream.readable, {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in scraping:', error);
    await writer.close();
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}