import { z } from 'zod';

export const querySchema = z.object({
    page: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : undefined),
    limit: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : undefined),
    filter: z.string().optional(),
    sort: z.string().optional(),
});