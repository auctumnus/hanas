import { z } from 'zod'
import { clean, cleanedLength } from '../clean'
import { username } from '../user/dto'

export const CreateLangDto = z.object({
  code: username,
  name: z
    .string()
    .refine(cleanedLength(1, 30), {
      message:
        'Lang name must be between 2 and 30 characters after being cleaned.',
    })
    .transform(clean),

  description: z
    .string()
    .refine(cleanedLength(0, 2500), {
      message: 'Description must be under 2500 characters.',
    })
    .transform(clean)
    .default(''),
})

export const UpdateLangDto = CreateLangDto.partial()
