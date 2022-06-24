const usernameRegex = /^([a-z0-9](-|_)?)+[a-z0-9]$/

export const getIsValidUsername = (username: string) => {
  if (!username) {
    return true
  } else if (username.length < 2 || username.length > 30) {
    return false
  } else {
    return usernameRegex.test(username)
  }
}

export const getUsernameValidityIssue = (username: string) => {
  if (username.length < 2) {
    return 'username_too_short'
  } else if (username.length > 30) {
    return 'username_too_long'
  } else if (/__|_-|-_|--/.test(username)) {
    return 'username_consecutive_hyphens'
  } else if (/[A-Z]/.test(username)) {
    return 'username_uppercase'
  } else if (/[ -,\.\/:-@\[-^`{-~}]/.test(username)) {
    return 'username_punctuation'
  } else if (/^_|_$|-$|$-/.test(username)) {
    return 'username_affixed_hyphens'
  } else if (!getIsValidUsername(username)) {
    return 'username_invalid'
  } else {
    return ''
  }
}
// https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
// "This requirement is a willful violation of RFC 5322"; thus, this isn't technically
// applicable to _all_ emails, so don't prevent a user from submitting it anyway
// just useful for
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export const getIsValidEmail = (email: string) =>
  email ? emailRegex.test(email) : true
