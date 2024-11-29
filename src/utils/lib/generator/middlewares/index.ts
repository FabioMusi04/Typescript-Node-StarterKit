import { Types } from 'mongoose';
import { z } from 'zod';

export const querySchema = z.object({
    page: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : undefined),
    limit: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : undefined),
    filter: z.string().optional(),
    sort: z.string().optional(),
});

export const getByIdSchema = z.object({
    id: z.string().transform((val: string) => new Types.ObjectId(val)),
});