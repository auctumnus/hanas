<script setup lang="ts">
import { Ref } from 'vue'

defineProps<{
  target: Ref<Element>
  position: 'vertical' | 'horizontal'
}>()
</script>

<template>
  <menu> </menu>
</template>
