
'use server';

/**
 * @fileOverview AI flow for suggesting optimal project scheduling on a 3D printer farm.
 *
 * - scheduleProject - A function that suggests scheduling options for a new project.
 * - ScheduleProjectInput - The input type for the scheduleProject function.
 * - ScheduleProjectOutput - The return type for the scheduleProject function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PrinterSchema = z.object({
  id: z.string(),
  name: z.string(),
  technology: z.string(),
});

const JobSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectCode: z.string().describe("A unique identifier for the project this job belongs to."),
  start: z.string().describe('ISO date string for start time'),
  end: z.string().describe('ISO date string for end time'),
  duration: z.number().describe('Duration in hours'),
  date: z.string().describe('ISO date string for the date the job starts on'),
  startHour: z.number(),
  color: z.string().optional(),
  isPreview: z.boolean().optional(),
  deadline: z.string().describe('ISO date string for deadline'),
  imageUrl: z.string().optional(),
});


const ScheduledJobSchema = z.object({
  printerId: z.string(),
  jobs: z.array(JobSchema),
});

const ScheduleProjectInputSchema = z.object({
  currentSchedule: z.array(ScheduledJobSchema).describe('The current schedule of all printers.'),
  printers: z.array(PrinterSchema).describe('The list of available printers.'),
  newProject: z.object({
    name: z.string().describe('Name of the new project to be scheduled.'),
    projectCode: z.string().describe("Unique code for the new project."),
    items: z.number().describe('Number of items in the project.'),
    durationPerItem: z.number().describe('The printing duration for a single item in hours.'),
    deadline: z.string().describe('The deadline for the project as an ISO date string.'),
    startDate: z.string().optional().describe('A preferred start date for the project as an ISO date string.'),
    technology: z.string().optional().describe('The required printer technology (e.g., FDM, SLA).'),
  }),
});
export type ScheduleProjectInput = z.infer<typeof ScheduleProjectInputSchema>;

const SuggestedScheduleSchema = z.object({
  description: z.string().describe("A brief summary of this scheduling option."),
  newJobs: z.array(JobSchema).describe("A list of new jobs that need to be added to the schedule. If a project is split, there will be multiple jobs in this array."),
  updatedSchedule: z.array(ScheduledJobSchema).describe('The complete updated schedule with the new project included.'),
  delayReason: z.string().optional().describe('If this option causes delays to other projects, this field explains why, mentioning which projects are delayed.'),
});

const ScheduleProjectOutputSchema = z.object({
  suggestions: z.array(SuggestedScheduleSchema).optional().describe('A list of up to 3 scheduling suggestions.'),
  reasoning: z.string().optional().describe('A summary of the reasoning behind the provided suggestions.'),
  feasibilityAnalysis: z.string().optional().describe("An analysis of why the request is not feasible. This is only populated if no suggestions can be made. It should ask clarifying questions or suggest changes, e.g., 'The deadline is too tight, can it be extended?'"),
});
export type ScheduleProjectOutput = z.infer<typeof ScheduleProjectOutputSchema>;


export async function scheduleProject(
  input: ScheduleProjectInput
): Promise<ScheduleProjectOutput> {
  return scheduleProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleProjectPrompt',
  input: { schema: ScheduleProjectInputSchema },
  output: { schema: ScheduleProjectOutputSchema },
  prompt: `You are an AI scheduler for a 3D printing farm. Your task is to find optimal scheduling options for a new project.

First, perform a quick feasibility check. If the project seems impossible (e.g., deadline is before start date, not enough time to print all items even with all printers), respond by ONLY filling out the 'feasibilityAnalysis' field. In your analysis, explain the problem and ask a clarifying question. For example: "The deadline is too tight. The project requires 100 hours of printing but there are only 48 hours available before the deadline. Can the deadline be extended?"

If the project is feasible, analyze the current schedule and the new project's requirements to generate suggestions.

New Project:
- Name: {{{newProject.name}}}
- Project Code: {{{newProject.projectCode}}}
- Number of Items: {{{newProject.items}}}
- Duration Per Item: {{{newProject.durationPerItem}}} hours
- Deadline: {{{newProject.deadline}}}
{{#if newProject.startDate}}- Preferred Start Date: {{{newProject.startDate}}}{{/if}}
{{#if newProject.technology}}- Required Technology: {{{newProject.technology}}}{{/if}}

Available Printers:
{{#each printers}}
- ID: {{id}}, Name: {{name}}, Technology: {{technology}}
{{/each}}

Current Schedule:
{{#each currentSchedule}}
Printer ID {{printerId}}:
{{#each jobs}}
  - Job '{{name}}' (Project: {{projectCode}}) starts at {{start}} for {{duration}} hours.
{{/each}}
{{/each}}

If feasible, provide up to 3 optimal scheduling suggestions.
1.  First, try to fit the project into an empty slot on a printer with the correct technology ({{newProject.technology}}) without delaying other projects.
2.  If the project has multiple items ({{{newProject.items}}} > 1), you can schedule the items on different compatible printers to run in parallel. This is a highly preferred option to save time. When you do this, create a separate job in the 'newJobs' array for each item.
3.  If necessary, find a place to insert the project by shifting existing jobs. If you shift jobs, you MUST calculate the ripple effect and clearly state which existing projects will be delayed in the 'delayReason' field.
4.  Prioritize suggestions that meet the deadline and a preferred start date.
5.  When you create jobs for the new project, you MUST assign them the project code: '{{{newProject.projectCode}}}'. Existing jobs should retain their original project codes.
6.  You MUST generate a new, unique 'id' for every job in the 'updatedSchedule', even for existing jobs that have been shifted. Do not reuse old IDs.
7.  The 'start' and 'end' fields for all jobs in the 'updatedSchedule' MUST be complete ISO 8601 date-time strings. The 'date' and 'startHour' fields should also be populated correctly based on the 'start' time.
8.  Each suggestion must have a concise 'description' summarizing the approach (e.g., "All items on one printer, no delays", "Split across 2 printers, shifts Project X").

For each suggestion, provide the full updated schedule and all new jobs created. Your response must be in the specified JSON format.
`,
});

const scheduleProjectFlow = ai.defineFlow(
  {
    name: 'scheduleProjectFlow',
    inputSchema: ScheduleProjectInputSchema,
    outputSchema: ScheduleProjectOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
