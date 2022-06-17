<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { isSmall } from '~/composables/device-size'

const route = useRoute()

const resolved = ref(false)
</script>

<template>
  <main
    :class="{
      'mr-0 px-0 h-card vcard': resolved,
      'ml-0': isSmall && resolved,
    }"
  >
    <Suspense @resolve="resolved = true">
      <template #default>
        <Profile :username="(route.params.username as string)" />
      </template>
      <template #fallback> loading... </template>
    </Suspense>
  </main>
</template>
