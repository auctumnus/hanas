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
}>()

const source = ref('')

// All code paths should set the source ref above.
const changePfp = async (newSrc?: string, oldSrc?: string) => {
  if (newSrc) {
    set(source, newSrc)
  } else {
    const user = await client.users.get(props.username || '')
    if (user instanceof Error) {
      set(source, missingPfp(props.username || ''))
    } else {
      const { profilePicture, displayName, username } = user
      if (profilePicture) {
        set(source, profilePicture)
      } else {
        set(source, missingPfp(displayName || username))
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
    <img class="rounded-full skeleton h-3/4 w-3/4" :src="source" ref="img" />
  </component>
</template>
