import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { selectedBusinessType } = req.body;

  if (!selectedBusinessType) {
    return res.status(400).json({ error: 'Missing selectedBusinessType' });
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
      return res.status(200).json(generatedContent);
    } else {
      throw new Error("Unexpected response from OpenAI API");
    }
  } catch (error) {
    console.error('Error generating AI content:', error);
    return res.status(500).json({ error: 'Failed to generate AI content' });
  }
}