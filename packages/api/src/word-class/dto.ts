import { z } from 'zod'
import { cleanedLength } from '../clean'

export const CreateWordClassDto = z.object({
  abbreviation: z.string().refine(cleanedLength(0, 10), {
    message: 'Abbreviation must be below 10 characters.',
  }),
  name: z.string().refine(cleanedLength(0, 100), {
    message: 'Name must be below 100 characters.',
  }),
})

export const UpdateWordClassDto = CreateWordClassDto.partial()
