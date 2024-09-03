import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { businessInfo } = await req.json();

    const prompt = `
      Given the following business information:
      Business Name: ${businessInfo.business_name}
      Business Type: ${businessInfo.business_type}
      Description: ${businessInfo.description}
      Key Products/Services: ${businessInfo.key_products_or_services.join(', ')}

      Generate 6 visual ad design approach suggestions that would be suitable for this business's advertisements. 
      They should be a creative description of how the ad should look including colors, fonts, imagery, people, and other elements.
      The visual styles approaches should be diverse and tailored to the specific business and its offerings.
      Consider the industry, target audience, and brand personality when suggesting these styles.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert graphic designer specializing in creating effective visual styles for advertisements." },
        { role: "user", content: prompt }
      ],
      functions: [
        {
          name: "generate_visual_style_suggestions",
          description: "Generate visual style suggestions based on business information",
          parameters: {
            type: "object",
            properties: {
              visualThemes: { 
                type: "array",
                items: { type: "string" },
                description: "List of 6 suggested visual styles or themes"
              }
            },
            required: ["visualThemes"]
          }
        }
      ],
      function_call: { name: "generate_visual_style_suggestions" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.name === "generate_visual_style_suggestions") {
      const suggestions = JSON.parse(functionCall.arguments);
      return NextResponse.json(suggestions);
    } else {
      throw new Error("Unexpected response from OpenAI API");
    }
  } catch (error) {
    console.error('Error generating visual style suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate visual style suggestions' }, { status: 500 });
  }
}