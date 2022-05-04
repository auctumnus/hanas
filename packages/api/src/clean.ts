export const clean = (s: string) => s.trim().split(/\s+/).join(' ')

export const cleanedLength = (min: number, max: number) => (s: string) => {
  const len = clean(s).length
  return len > min && len < max
}
