import { LangPermission } from '@prisma/client'
import { NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { err } from '../error'
import { UpdateLangPermissionDto } from './dto'

/**
 * Long and complex permissions checks!
 * You should call `checkPerms` before this.
 *
 * The rules are as follows:
 * 1. The owner can edit anyone's permissions.
 * 2. Users with `changePermissions` can edit the permissions of anyone,
 *    except for other users with `changePermissions` (and the owner, as in rule 5).
 *    (My mental model for this is that the owner is an "admin", and
 *    users with `changePermissions` are "mods".)
 * 3. If the ownerⁱ assigns owner to someone elseʲ, theyⁱ are no longer
 *    owner.
 * 4. A user cannot edit their own permissions. (They can remove all of
 *    their permissions from themselves if they are not the owner by
 *    sending a `DELETE` to their own permissions.)
 * 5. Nobody can edit the permissions of the owner.
 * 6. Only the owner can grant `changePermissions`.
 *
 * Rule 1 and 2 are handled by `checkPerms`.
 * Rule 3 needs to be handled outside of this function since that
 * depends on whether we're editing a permission or inviting a user.
 */
export const checkCanAssign = (
  ourPerms: LangPermission,
  theirPerms: LangPermission,
  newPerms: z.infer<typeof UpdateLangPermissionDto>,
  next: NextFunction
) => {
  // Error throwing helper.
  const e = (m: string) => next(err(403, m))

  if (ourPerms.id === theirPerms.id) {
    e('You cannot edit your own permissions.') // rule 4
    return false
  } else if (theirPerms.owner) {
    e('You cannot edit the permissions of the owner.') // rule 5
    return false
  } else if (ourPerms.changePermissions && theirPerms.changePermissions) {
    e('You cannot edit the permissions of another user with changePermissions.') // rule 2
    return false
  } else if (!ourPerms.owner && newPerms.changePermissions) {
    e('Only the owner can grant changePermissions.') // rule 6
    return false
  }

  return true
}

export const checkPerms = async (code: string, username: string) =>
  !!(
    await prisma.langPermission.findMany({
      where: {
        lang: { code },
        user: { username },
        OR: [{ owner: true }, { changePermissions: true }],
      },
      include: {
        lang: true,
        user: true,
      },
      take: 1, // Otherwise we could have an easy DoS.
    })
  ).length

export * from './endpoints'
