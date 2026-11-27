import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    navLabel: z.string().trim().min(1),
    order: z.number().int().nonnegative(),
    section: z.enum(['foundation', 'component']).default('component'),
    figma: z.url().optional(),
    // Evidence-backed accessibility statement for the Component Status block.
    accessibilityStatus: z.string().trim().min(1).optional(),
  }),
});

export const collections = { docs };
