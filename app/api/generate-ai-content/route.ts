import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { selectedBusinessType } = await request.json();

  if (!selectedBusinessType) {
    return NextResponse.json({ error: 'Missing selectedBusinessType' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert ad creative designer. You help the user describe an ad creative image for the given business. Always choose a specific product in the business type" },
        { role: "user", content: `Create a compelling ad for a ${selectedBusinessType} business type. Include a Short headline, short punchy body text, call-to-action, and detailed ad design description as an instructional prompt on how the ad image should appear. Make it concise and impactful.` },
      ],
      functions: [
        {
          name: "generate_ad_content",
          description: "Generate ad content based on business type",
          parameters: {
            type: "object",
            properties: {
              headline: { type: "string" },
              body_text: { type: "string" },
              call_to_action_text: { type: "string" },
              instructional_prompt: { type: "string" },
            },
            required: ["headline", "body_text", "call_to_action_text", "instructional_prompt"],
          },
        },
      ],
      function_call: { name: "generate_ad_content" },
    });

    const functionCall = completion.choices[0].message.function_call;
    if (functionCall && functionCall.name === "generate_ad_content") {
      const generatedContent = JSON.parse(functionCall.arguments);
      return NextResponse.json(generatedContent);
    } else {
      throw new Error("Unexpected response from OpenAI API");
    }
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json({ error: 'Failed to generate AI content' }, { status: 500 });
  }
}