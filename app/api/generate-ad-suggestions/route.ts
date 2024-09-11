import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessInfo } = body;

    // Input validation
    if (!businessInfo || typeof businessInfo !== 'object') {
      return NextResponse.json({ error: 'Invalid or missing businessInfo' }, { status: 400 });
    }

    const { business_name, business_type, description, key_products_or_services } = businessInfo;

    if (!business_name || !business_type || !description || !Array.isArray(key_products_or_services)) {
      return NextResponse.json({ error: 'Missing required business information' }, { status: 400 });
    }

    const prompt = `
      Given the following business information:
      Business Name: ${business_name}
      Business Type: ${business_type}
      Description: ${description}
      Key Products/Services: ${key_products_or_services.join(', ')}

      Generate 3 suggestions each for:
      1. Business Types (broader categories that this business might fall under)
      2. Ad Headlines (catchy, attention-grabbing headlines for an advertisement)
      3. Ad Copy (short, compelling ad copy to accompany the headlines)

      Ensure that the suggestions are diverse and tailored to the specific business information provided.
    `;
    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert advertising copywriter tasked with generating ad content suggestions based on business information." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "generate_ad_suggestions",
          description: "Generate ad content suggestions based on business information",
          parameters: {
            type: "object",
            properties: {
              businessTypes: { 
                type: "array",
                items: { type: "string" },
                description: "List of 3 suggested business types"
              },
              headlines: { 
                type: "array",
                items: { type: "string" },
                description: "List of 3 suggested ad headlines"
              },
              adCopies: { 
                type: "array",
                items: { type: "string" },
                description: "List of 3 suggested ad copies"
              }
            },
            required: ["businessTypes", "headlines", "adCopies"]
          }
        }
      ],
      function_call: { name: "generate_ad_suggestions" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.name === "generate_ad_suggestions") {
      try {
        const suggestions = JSON.parse(functionCall.arguments);
        return NextResponse.json(suggestions);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw response:', functionCall.arguments);
        return NextResponse.json({ error: 'Failed to parse OpenAI response' }, { status: 500 });
      }
    } else {
      console.error('Unexpected response from OpenAI API:', completion.choices[0].message);
      return NextResponse.json({ error: 'Unexpected response from OpenAI API' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating ad suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate ad suggestions', details: error }, { status: 500 });
  }
}