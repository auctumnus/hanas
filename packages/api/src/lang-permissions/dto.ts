import { z } from 'zod'

export const UpdateLangPermissionDto = z
  .object({
    owner: z.boolean(),
    changePermissions: z.boolean(),
    changeId: z.boolean(),
    changeInfo: z.boolean(),
    changeWords: z.boolean(),
  })
  .partial()
