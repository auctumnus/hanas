import { HanasClient } from '@hanas-app/api-helper'

const hanasURL = import.meta.env.HANAS_URL || 'http://localhost:1337'
const kratosURL = import.meta.env.HANAS_URL || 'http://localhost:4433'

export const client = new HanasClient({ hanasURL, kratosURL })

if (window) {
  const textStyle = 'font-size:larger;font-family:sans-serif;color:#81a1c1'
  console.log(
    '%cAdded the Hanas API helper to %cwindow.api%c. Feel free to play around!',
    textStyle,
    'font-size:larger;font-family: monospace;padding:0.25rem;border-radius:0.5rem;background-color:#777',
    textStyle
  )
  console.log(
    "%cPlease be careful about pasting things in here! Attackers can use this as a way to get into your account if you're not careful!!",
    'font-size:x-large'
  )
  // @ts-ignore
  window.api = client
}
