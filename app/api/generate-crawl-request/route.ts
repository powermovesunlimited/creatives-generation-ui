import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  console.log('Received request to /api/generate-crawl-request');
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { url } = body;
    console.log('Extracted URL:', url);

    if (!url) {
      console.error('Missing URL in request');
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    console.log('Calling OpenAI API...');
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert in web scraping and data extraction, specializing in creating targeted extraction strategies for business information." },
          { role: "user", content: `Create a highly focused extraction strategy for the following URL: ${url}. The goal is to extract specific business information:

1. Business Name: Look for the official name of the business, often found in headers, footers, or 'About Us' sections.
2. Business Type: Identify the industry or category of the business (e.g., healthcare, technology, retail).
3. Brief Description: Find a concise description of the business, its mission, or main offering (1-2 sentences).
4. Key Products or Services: Identify 3-5 main products or services offered by the business.

Your extraction strategy should:
- Focus on relevant HTML elements (e.g., h1, h2, meta tags, specific div classes) that are likely to contain this information.
- Use semantic filters to target sections like 'About Us', 'Our Services', or 'Products'.
- Set appropriate word count thresholds to capture concise information.
- Utilize LLMExtractionStrategy with specific instructions for each piece of information.

Provide a strategy that will result in clean, relevant data for these specific fields.` },
        ],
        functions: [
          {
            name: "generate_extraction_strategy",
            description: "Generate a targeted extraction strategy for the Azure crawl service",
            parameters: {
              type: "object",
              properties: {
                extraction_strategy: { type: "string", enum: ["LLMExtractionStrategy", "CosineStrategy"] },
                extraction_strategy_args: {
                  type: "object",
                  properties: {
                    provider: { type: "string" },
                    schema: { 
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["object"] },
                        properties: {
                          type: "object",
                          properties: {
                            business_name: { type: "object", properties: { type: { type: "string" }, description: { type: "string" } } },
                            business_type: { type: "object", properties: { type: { type: "string" }, description: { type: "string" } } },
                            description: { type: "object", properties: { type: { type: "string" }, description: { type: "string" } } },
                            key_products_or_services: { 
                              type: "object", 
                              properties: { 
                                type: { type: "string" }, 
                                items: { type: "object", properties: { type: { type: "string" } } },
                                description: { type: "string" }
                              } 
                            }
                          }
                        },
                        required: { type: "array", items: { type: "string" } }
                      }
                    },
                    extraction_type: { type: "string" },
                    instruction: { type: "string" },
                    semantic_filter: { type: "string" },
                    word_count_threshold: { type: "number" },
                    max_dist: { type: "number" },
                    top_k: { type: "number" },
                    sim_threshold: { type: "number" }
                  }
                }
              },
              required: ["extraction_strategy", "extraction_strategy_args"],
            },
          },
        ],
        function_call: { name: "generate_extraction_strategy" },
      });

      console.log('OpenAI API response:', completion);

      const functionCall = completion.choices[0].message.function_call;
      if (functionCall && functionCall.name === "generate_extraction_strategy") {
        let generatedStrategy = JSON.parse(functionCall.arguments);
        
        // Ensure the provider is always set to "openai/gpt-4o-mini"
        if (generatedStrategy.extraction_strategy === "LLMExtractionStrategy") {
          generatedStrategy.extraction_strategy_args.provider = "openai/gpt-4o";
        }

        console.log('Generated strategy:', generatedStrategy);
        return NextResponse.json(generatedStrategy);
      } else {
        console.error('Unexpected response from OpenAI API');
        throw new Error("Unexpected response from OpenAI API");
      }
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError);
      throw openaiError;
    }
  } catch (error) {
    console.error('Error generating extraction strategy:', error);
    return NextResponse.json({ error: 'Failed to generate extraction strategy', details: error.message }, { status: 500 });
  }
}