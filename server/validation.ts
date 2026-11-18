import { z } from 'zod';
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Escribe al menos 2 caracteres.').max(100),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine(
      (v) =>
        /^[+\d\s().-]+$/.test(v) &&
        v.replace(/\D/g, '').length >= 7 &&
        v.replace(/\D/g, '').length <= 15,
      'Escribe entre 7 y 15 dígitos.',
    ),
  email: z.union([z.literal(''), z.email().max(254)]).optional(),
  brandId: z.number().int().positive().optional(),
  modelId: z.number().int().positive().optional(),
  message: z.string().trim().min(10, 'Escribe al menos 10 caracteres.').max(2000),
  consent: z.literal(true, { error: 'Debes autorizar el tratamiento para enviar.' }),
  website: z.string().max(0).optional(),
});
export const workSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5000),
  type: z.string().trim().max(100),
  modelId: z.number().int().positive().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
});
