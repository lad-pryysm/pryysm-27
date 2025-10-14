'use server';

/**
 * @fileOverview An AI flow for enhancing text descriptions.
 *
 * - enhanceText - A function that takes a text and returns an improved version.
 * - EnhanceTextInput - The input type for the enhanceText function.
 * - EnhanceTextOutput - The return type for the enhanceText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceTextInputSchema = z.object({
  text: z.string().describe('The text to be enhanced.'),
});
export type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced, professional version of the text.'),
});
export type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;

export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  return enhanceTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceTextPrompt',
  input: { schema: EnhanceTextInputSchema },
  output: { schema: EnhanceTextOutputSchema },
  prompt: `You are an expert copywriter. Enhance the following product description for clarity, detail, and professionalism. Rewrite it to be compelling for a quotation or invoice.

Original text: {{{text}}}
`,
});

const enhanceTextFlow = ai.defineFlow(
  {
    name: 'enhanceTextFlow',
    inputSchema: EnhanceTextInputSchema,
    outputSchema: EnhanceTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
