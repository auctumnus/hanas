<script setup lang="ts">
import { User } from '@hanas-app/api-helper'
import { set } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { client } from '~/hanas-api'

const props = defineProps<{
  username?: string
  src?: string
}>()

const source = ref(props.src || '')

onMounted(() =>
  props.src
    ? undefined
    : client.users
        .get(props.username!)
        .then((user: User) =>
          set(
            source,
            user.profilePicture ||
              'https://ui-avatars.com/api/?name=' +
                (user.displayName || user.username)
          )
        )
)
</script>

<template>
  <div
    class="flex justify-center items-center h-12 w-12"
    :aria-label="username"
    :title="username"
  >
    <img class="rounded-full skeleton h-3/4 w-3/4" :src="source" />
  </div>
</template>
