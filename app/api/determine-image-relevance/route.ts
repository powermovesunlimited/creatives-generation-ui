import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ImageData {
  src: string;
  alt: string;
  desc: string;
  score: number;
  type: string;
}

function isValidImageUrl(url: string): boolean {
  const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const extension = url.split('.').pop()?.toLowerCase();
  return validExtensions.includes(extension);
}

export async function POST(request: Request) {
  console.log('Received request to /api/determine-image-relevance');
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { images, businessContext } = body;
    console.log('Extracted images:', images);
    console.log('Extracted businessContext:', businessContext);

    if (!images || !Array.isArray(images) || images.length === 0 || !businessContext) {
      console.error('Missing or invalid images or businessContext in request');
      return NextResponse.json({ error: 'Missing or invalid images or businessContext' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    console.log('Calling OpenAI API...');
    const relevantImages: ImageData[] = [];

    for (const image of images) {
      if (!isValidImageUrl(image.src)) {
        console.log(`Skipping invalid image: ${image.src}`);
        continue;
      }

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that determines if an image is relevant for creating an advertisement based on the provided business context."
            },
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Business context: ${businessContext}\n\nIs this image relevant for creating an advertisement for this business? Analyze the image and provide a structured response.` 
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image.src,
                  },
                }
              ],
            },
          ],
          functions: [
            {
              name: "analyze_image_relevance",
              description: "Analyze the relevance of an image for advertisement creation",
              parameters: {
                type: "object",
                properties: {
                  isRelevant: {
                    type: "boolean",
                    description: "Whether the image is relevant for creating an advertisement"
                  },
                  relevanceScore: {
                    type: "number",
                    description: "A score from 0 to 100 indicating how relevant the image is"
                  },
                  explanation: {
                    type: "string",
                    description: "A brief explanation of why the image is or isn't relevant"
                  },
                  suggestedUse: {
                    type: "string",
                    description: "If relevant, a suggestion on how to use this image in an advertisement"
                  }
                },
                required: ["isRelevant", "relevanceScore", "explanation"]
              }
            }
          ],
          function_call: { name: "analyze_image_relevance" }
        });

        const functionCall = completion.choices[0].message.function_call;
        if (functionCall && functionCall.name === "analyze_image_relevance") {
          const analysis = JSON.parse(functionCall.arguments);
          
          if (analysis.isRelevant) {
            relevantImages.push({
              ...image,
              relevanceAnalysis: analysis
            });
          }
        } else {
          console.error('Unexpected response from OpenAI API');
          throw new Error("Unexpected response from OpenAI API");
        }
      } catch (error) {
        console.error(`Error processing image ${image.src}:`, error);
      }
    }

    console.log('Relevant images:', relevantImages);
    return NextResponse.json({ relevantImages });
  } catch (error) {
    console.error('Error determining image relevance:', error);
    return NextResponse.json({ error: 'Failed to determine image relevance', details: error.message }, { status: 500 });
  }
}