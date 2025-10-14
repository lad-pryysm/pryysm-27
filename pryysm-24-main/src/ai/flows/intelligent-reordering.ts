'use server';

/**
 * @fileOverview AI flow for generating intelligent reordering alerts based on historical usage and lead times.
 *
 * - generateReorderAlert - A function that generates inventory reorder alerts.
 * - GenerateReorderAlertInput - The input type for the generateReorderAlert function.
 * - GenerateReorderAlertOutput - The return type for the generateReorderAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReorderAlertInputSchema = z.object({
  itemName: z.string().describe('The name of the inventory item.'),
  historicalUsageData: z
    .string()
    .describe(
      'Historical usage data for the item, including dates and quantities used.'
    ),
  leadTimeDays: z.number().describe('The lead time in days for reordering the item.'),
  currentStockLevel: z
    .number()
    .describe('The current stock level of the item.'),
  reorderThreshold: z
    .number()
    .describe(
      'The minimum stock level at which a reorder should be triggered.'
    ),
});

export type GenerateReorderAlertInput = z.infer<
  typeof GenerateReorderAlertInputSchema
>;

const GenerateReorderAlertOutputSchema = z.object({
  shouldReorder: z
    .boolean()
    .describe(
      'Whether a reorder is recommended based on the input data and analysis.'
    ),
  reorderQuantity: z
    .number()
    .optional()
    .describe(
      'The recommended reorder quantity to avoid stockouts, if a reorder is recommended.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why a reorder is recommended, including factors considered and calculations made.'
    ),
});

export type GenerateReorderAlertOutput = z.infer<
  typeof GenerateReorderAlertOutputSchema
>;

export async function generateReorderAlert(
  input: GenerateReorderAlertInput
): Promise<GenerateReorderAlertOutput> {
  return generateReorderAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReorderAlertPrompt',
  input: {schema: GenerateReorderAlertInputSchema},
  output: {schema: GenerateReorderAlertOutputSchema},
  prompt: `You are an AI assistant designed to generate inventory reorder alerts for a 3D printing farm.

  Based on the historical usage data, lead time, current stock level, and reorder threshold, determine whether a reorder is necessary.
  If a reorder is recommended, calculate the appropriate reorder quantity to avoid stockouts.

  Item Name: {{{itemName}}}
  Historical Usage Data: {{{historicalUsageData}}}
  Lead Time (Days): {{{leadTimeDays}}}
  Current Stock Level: {{{currentStockLevel}}}
  Reorder Threshold: {{{reorderThreshold}}}

  Consider the following factors when determining whether to reorder:
  - Average daily usage based on historical data.
  - Lead time required to receive the reordered items.
  - Current stock level compared to the reorder threshold.

  Provide a clear explanation of your reasoning, including any calculations made to determine the reorder quantity.
`,
});

const generateReorderAlertFlow = ai.defineFlow(
  {
    name: 'generateReorderAlertFlow',
    inputSchema: GenerateReorderAlertInputSchema,
    outputSchema: GenerateReorderAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
