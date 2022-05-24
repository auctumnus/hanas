export type AuthErrors =
  | {
      status: 401
      message: 'You must be authenticated to access this endpoint.'
    }
  | {
      status: 403
      message: 'You do not have permission to edit another user.'
    }

export type BadRequestError = {
  status: 400
  message: 'Input validation error; see issues for details'
}
