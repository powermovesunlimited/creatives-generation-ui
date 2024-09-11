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

      Generate 6 visual ad design prompt suggestions that would be suitable for this business's advertisements that can be
      given to an image generation ai to create the ad image. 
      They should be a creative description of how the ad should look including colors, fonts, imagery, people, and other elements.
      The visual prompt approaches should be diverse and tailored to the specific business and its offerings.
      Consider the industry, target audience, and brand personality when suggesting these styles.

      The following is an example of correct response:

      Sleek designer high heel shoe, vibrant red patent leather, placed on a mirrored surface. Soft studio lighting creating subtle reflections. Minimalist white background. Sharp focus on the shoe's curves and textures. Cinematic composition with the shoe angled slightly to showcase its profile. Small water droplets on the shoe's surface for added glamour. Text overlay in an elegant sans-serif font: 'Step into Luxury

    `;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
                description: "List of 6 suggested visual ad design style prompt suggestions"
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