import { z } from 'zod'
import { clean, cleanedLength } from '../clean'

export const CreateLangDto = z.object({
  code: z
    .string()
    .min(3)
    .max(5)
    .regex(/^[a-z]+$/),
  name: z
    .string()
    .refine(cleanedLength(2, 30), {
      message:
        'Lang name must be between 2 and 30 characters after being cleaned.',
    })
    .transform(clean),

  description: z
    .string()
    .refine(cleanedLength(1, 2500), {
      message: 'Description must be under 2500 characters.',
    })
    .transform(clean),
})

export const UpdateLangDto = CreateLangDto.partial()
