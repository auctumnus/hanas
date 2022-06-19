<script setup lang="ts">
import { User } from '@hanas-app/api-helper'
import { get, refDefault, set } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { client } from '~/hanas-api'

const missingPfp = (name: string) => 'https://ui-avatars.com/api/?name=' + name

const props = defineProps<{
  username?: string
  displayName?: string
  src?: string
}>()

const s = computed(() => props.src || '')

const source = ref('')

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

watch(s, changePfp)
onMounted(() => changePfp(props.src, ''))
</script>

<template>
  <div
    class="flex justify-center items-center h-12 w-12"
    :aria-label="displayName || username"
    :title="displayName || username"
  >
    <img class="rounded-full skeleton h-3/4 w-3/4" :src="source" />
  </div>
</template>
