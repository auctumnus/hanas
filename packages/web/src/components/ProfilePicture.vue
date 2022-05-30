<script setup lang="ts">
import { set } from '@vueuse/core'
import { ref } from 'vue'
import { client } from '~/hanas-api'

const props = defineProps<{
  username?: string
  size?: 'sm' | 'md' | 'lg'
  src?: string
}>()

if (props.username && props.src)
  console.error('must only specify one of username or src')

const getPfpSrc = () => {
  if (window !== undefined) {
    /* TODO: replace this with actual logic */
    return (
      new URL(
        `users/${props.username}/profilePicture`,
        client.options.hanasURL
      ) + ''
    )
  } else {
    return ''
  }
}

const source = ref(props.src ? props.src : getPfpSrc())

const pfpErrored = ref(false)

const onError = () => {
  set(pfpErrored, true)
}
</script>

<template>
  <div
    class="h-12 w-12 flex justify-center items-center"
    :aria-label="username"
    :title="username"
  >
    <mdi-account class="rounded-full h-8 w-8" v-if="pfpErrored" />
    <img class="rounded-full h-8 w-8" :src="source" @error="onError()" v-else />
  </div>
</template>
