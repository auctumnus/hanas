import { get, useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

export const isSmall = useMediaQuery('(max-width: 599px)')
export const isMedium = useMediaQuery('(min-width: 600px)')
export const isLarge = useMediaQuery('(min-width: 840px)')
export const isHuge = useMediaQuery('(min-width: 1100px)')

export const size = computed(() => {
  if (get(isHuge)) {
    return 'huge'
  } else if (get(isLarge)) {
    return 'large'
  } else if (get(isMedium)) {
    return 'medium'
  } else {
    return 'small'
  }
})
