<script setup lang="ts">
const props = defineProps<{
  username: string | undefined
  size: 'sm' | 'md' | 'lg' | undefined
  src: string | undefined
}>()

if ((!props.username && !props.src) || (props.username && props.src)) {
  console.error('must only specify one of username or src')
}

const getPfpSrc = () => {
  if (window !== undefined) {
    /* TODO: replace this with actual logic */
    return (
      new URL(`users/${props.username}/profilePicture`, window.location.href) +
      ''
    )
  } else {
    return ''
  }
}

const source = props.src ? props.src : getPfpSrc()
</script>

<template>
  <div
    class="h-12 w-12 flex justify-center items-center"
    :aria-label="username"
    :title="username"
  >
    <img class="rounded-full h-8 w-8" :src="source" />
  </div>
</template>
