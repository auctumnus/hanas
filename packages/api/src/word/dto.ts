import { z } from 'zod'
import { clean, cleanedLength } from '../clean'

const oneToOneHundred = (fieldName: string) =>
  z
    .string()
    .refine(cleanedLength(0, 100), {
      message:
        fieldName +
        'Definition must be between 1 and 100 characters after being cleaned.',
    })
    .transform(clean)

export const CreateWordDto = z.object({
  word: oneToOneHundred('Word'),
  definition: oneToOneHundred('Definition'),
  ipa: oneToOneHundred('IPA').optional(),
  notes: z
    .string()
    .refine(cleanedLength(0, 1000), {
      message:
        'Notes must be between 1 and 1000 characters after being cleaned.',
    })
    .optional(),
  wordClasses: z
    .array(
      z.string().refine(cleanedLength(0, 10), {
        message:
          'Each word class must have an abbreviation below 10 characters.',
      })
    )
    .max(100)
    .optional(),
})

export const UpdateWordDto = CreateWordDto.partial()
