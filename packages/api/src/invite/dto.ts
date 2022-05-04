import { z } from 'zod'

export const CreateInviteDto = z
  .object({
    owner: z.boolean().default(false),
    changePermissions: z.boolean().default(false),
    changeId: z.boolean().default(false),
    changeInfo: z.boolean().default(false),
    changeWords: z.boolean().default(false),

    username: z.string(),
  })
  .or(
    z.object({
      accept: z.boolean(),
    })
  )
