<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  min?: number
  max?: number

  modelValue: number
}>()

const _min = props.min || 1
const _max = props.max || 100

const value = ref(Math.round((_max - _min) / 2 + _min) + '')
</script>

<template>
  <input
    v-model="value"
    type="range"
    @input="$emit('update:model-value', Number(value))"
  />
</template>
