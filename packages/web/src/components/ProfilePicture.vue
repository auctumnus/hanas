<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { client } from '~/hanas-api'

const img: Ref<HTMLImageElement | null> = ref(null)
const missingPfp = (name: string, color?: string) =>
  `https://ui-avatars.com/api/?name=${name}?size=${get(img)?.clientWidth}${
    color ? `?color=${color}` : ''
  }`

const props = defineProps<{
  username?: string
  displayName?: string
  src?: string
  disableLink?: boolean
  big?: boolean
}>()

const source = ref('')
const color = ref('dddddd')
const textColor = computed(() => {
  // Returns a dark or bright text color such that the text should be readable.
  // Uses https://alienryderflex.com/hsp.html
  const c = +`0x${get(color)}`
  const r = c >> 16
  const g = (c >> 8) & 255
  const b = (c >> 8) & 255
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  if (hsp > 127.5) {
    // bright text color
    return '1A1C1E'
  } else {
    // dark text color
    return 'FCFCFF'
  }
})
const abbrev = props.src
  ? ''
  : (() => {
      const split = props.username!.split(/\s/)
      const first = split[0][0]
      const last = split.length > 1 ? split[split.length - 1][0] : ''
      return (first + last).toLocaleUpperCase()
    })()
const hasPfp = ref(!!props.src)

const changePfp = async (newSrc?: string, oldSrc?: string) => {
  if (newSrc) {
    set(source, newSrc)
  } else {
    const user = await client.users.get(props.username || '')
    if (user instanceof Error) {
      set(hasPfp, false)
    } else {
      const { profilePicture, gender } = user
      set(color, gender)
      if (profilePicture) {
        set(hasPfp, true)
        set(source, profilePicture)
      } else {
        set(hasPfp, false)
      }
    }
  }
}

const s = computed(() => props.src || '')
watch(s, changePfp)
onMounted(() => changePfp(props.src, ''))
</script>

<template>
  <component
    :is="disableLink ? 'div' : 'router-link'"
    class="block flex justify-center items-center h-12 w-12"
    :aria-label="displayName || username"
    :title="displayName || username"
    :to="`/users/${username}`"
  >
    <img
      class="rounded-full skeleton h-3/4 w-3/4"
      :src="source"
      ref="img"
      v-if="hasPfp"
    />
    <div
      class="rounded-full flex justify-center items-center select-none"
      :class="[big ? 'h-full w-full' : 'h-3/4 w-3/4']"
      :style="`background-color:#${color};color:#${textColor}`"
      v-else
    >
      <span>{{ abbrev }}</span>
    </div>
  </component>
</template>
