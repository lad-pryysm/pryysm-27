
'use server';
/**
 * @fileOverview An AI flow for generating images for the landing page.
 *
 * - generateLandingImage - A function that takes a prompt and returns an image URL.
 * - GenerateLandingImageInput - The input type for the generateLandingImage function.
 * - GenerateLandingImageOutput - The return type for the generateLandingImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLandingImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateLandingImageInput = z.infer<typeof GenerateLandingImageInputSchema>;

const GenerateLandingImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URL of the generated image.'),
});
export type GenerateLandingImageOutput = z.infer<typeof GenerateLandingImageOutputSchema>;

export async function generateLandingImage(input: GenerateLandingImageInput): Promise<GenerateLandingImageOutput> {
  return generateLandingImageFlow(input);
}

const generateLandingImageFlow = ai.defineFlow(
  {
    name: 'generateLandingImageFlow',
    inputSchema: GenerateLandingImageInputSchema,
    outputSchema: GenerateLandingImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A photorealistic, professional, and clean 3D render of the following concept for a company website, with a light, minimalist background: ${input.prompt}`,
       config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ]
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
