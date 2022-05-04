import { z } from 'zod'
import { clean, cleanedLength } from '../clean'

// This regex _should_ disallow usernames like "-a-", "a_", "_-_-", and such.
// It requires a username to begin and end with alphanumeric characters,
// and allows a single hyphen/underscore in between alphanumerics.
export const username = z
  .string()
  .min(2)
  .max(30)
  .regex(/^([a-z0-9](-|_)?)+[a-z0-9]$/)

export const UpdateUserDto = z
  .object({
    username,

    // Because we allow spaces in display names, we need to do a little more
    // cleaning here.
    // Unicode is big and this is probably liable to be abused. Don't assume
    // people won't have weird display names. There's a reason usernames are the
    // identifier.
    displayName: z
      .string()
      .refine(cleanedLength(2, 30), {
        message:
          'Display name must be between 2 and 30 characters after being cleaned.',
      })
      .transform(clean),

    // is this like reasonable. i hope it is
    description: z.string().max(1000),

    // lol. lmao
    gender: z.string().regex(/^([a-fA-F0-9]{3}){1,2}$/), // hex color

    pronouns: z
      .string()
      .refine(cleanedLength(2, 15), {
        message:
          'Pronouns must be between 2 and 15 characters after being cleaned.',
      })
      .transform(clean),
  })
  .partial()
