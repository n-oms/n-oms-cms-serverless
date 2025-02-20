import { z } from 'zod';

export const UserHandlerSchemas = {
    CreateUser: z.object({
        email: z.string().email(),
        data: z.any(),
    }),
    GetUser: z.object({
        email: z.string().email(),
    }),
    UpdateUser: z.object({
        email: z.string().email(),
        data: z.any(),
    }),
};
