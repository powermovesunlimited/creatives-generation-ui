export interface AdContent {
  headline: string;
  body_text: string;
  call_to_action_text: string;
  instructional_prompt: string;
}

export async function generateAIContent(selectedBusinessType: string): Promise<AdContent> {
  try {
    const response = await fetch('/api/generate-ai-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedBusinessType }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI content');
    }

    const data = await response.json();
    return data as AdContent;
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw new Error('Failed to generate AI content. Please try again.');
  }
}