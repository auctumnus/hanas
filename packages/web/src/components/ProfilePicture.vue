<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { client } from '~/hanas-api'

const img: Ref<HTMLImageElement | null> = ref(null)
const missingPfp = (name: string, color?: string) =>
  'https://ui-avatars.com/api/' +
  '?name=' +
  name +
  '?size=' +
  get(img)?.clientWidth +
  color
    ? '?color=' + color
    : ''

const props = defineProps<{
  username?: string
  displayName?: string
  src?: string
}>()

const source = ref('')

// All code paths should set the source ref above.
const changePfp = async (newSrc?: string, oldSrc?: string) => {
  if (newSrc) {
    set(source, newSrc)
  } else {
    if (!props.username) throw new Error('no username or src given!')
    try {
      const { profilePicture, displayName, username } = await client.users.get(
        props.username
      )
      if (profilePicture) {
        set(source, profilePicture)
      }
      set(source, missingPfp(displayName || username))
    } catch (e) {
      set(source, missingPfp(props.username))
    }
  }
}

const s = computed(() => props.src || '')
watch(s, changePfp)
onMounted(() => changePfp(props.src, ''))
</script>

<template>
  <div
    class="flex justify-center items-center h-12 w-12"
    :aria-label="displayName || username"
    :title="displayName || username"
  >
    <img class="rounded-full skeleton h-3/4 w-3/4" :src="source" ref="img" />
  </div>
</template>
