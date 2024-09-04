import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  try {
    const body = await req.json();
    const { markdownContent } = body;

    if (!markdownContent) {
      return NextResponse.json({ error: 'Missing markdown content' }, { status: 400 });
    }

    console.log('Interpreting scraped data...');
    const interpretedData = await interpretScrapedData(markdownContent);

    return NextResponse.json({ interpretedData });
  } catch (error) {
    console.error('Error in interpret-data:', error);
    return NextResponse.json({ error: 'An error occurred while interpreting the data', details: error.message }, { status: 500 });
  }
}