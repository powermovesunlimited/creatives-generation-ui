import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { businessInfo } = await req.json();

    const prompt = `
      Given the following business information:
      Business Name: ${businessInfo.business_name}
      Business Type: ${businessInfo.business_type}
      Description: ${businessInfo.description}
      Key Products/Services: ${businessInfo.key_products_or_services.join(', ')}

      Generate 6 compelling and diverse call-to-action (CTA) phrases that would be suitable for this business's advertisements. 
      The CTAs should be short, action-oriented, and tailored to the specific business and its offerings.
    `;
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert copywriter specializing in creating effective call-to-action phrases for advertisements." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "generate_cta_suggestions",
          description: "Generate call-to-action suggestions based on business information",
          parameters: {
            type: "object",
            properties: {
              callToActions: { 
                type: "array",
                items: { type: "string" },
                description: "List of 6 suggested call-to-action phrases"
              }
            },
            required: ["callToActions"]
          }
        }
      ],
      function_call: { name: "generate_cta_suggestions" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.name === "generate_cta_suggestions") {
      const suggestions = JSON.parse(functionCall.arguments);
      return NextResponse.json(suggestions);
    } else {
      throw new Error("Unexpected response from OpenAI API");
    }
  } catch (error) {
    console.error('Error generating CTA suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate CTA suggestions' }, { status: 500 });
  }
}