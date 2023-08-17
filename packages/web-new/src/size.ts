import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

export const sizes = {
  compact: useMediaQuery('(max-width: 601px)'),
  medium: useMediaQuery('(max-width: 841px)'),
  expanded: useMediaQuery('(min-width: 840px)')
}

export const size = computed(() => {
  if (sizes.compact.value) return 'compact'
  if (sizes.medium.value) return 'medium'
  return 'expanded'
})

export const isCompact = computed(() => size.value === 'compact')
export const isMedium = computed(() => size.value === 'medium')
export const isExpanded = computed(() => size.value === 'expanded')
