import { useMediaQuery } from '@vueuse/core'

export const isSmall = useMediaQuery('(max-width: 599px)')
export const isMedium = useMediaQuery('(min-width: 600px)')
export const isLarge = useMediaQuery('(min-width: 840px)')
export const isHuge = useMediaQuery('(min-width: 1000px')
