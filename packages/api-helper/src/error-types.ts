export type AuthStatuses = 401 | 403

export type AuthMessages =
  | 'You must be authenticated to access this endpoint.'
  | 'You do not have permission to edit another user.'

export type BadRequestMessage = 'Input validation error; see issues for details'
