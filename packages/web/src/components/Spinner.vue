<script lang="ts" setup>
import { get, refDefault } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { computed, ref } from 'vue'

const props = defineProps<{
  size?: string
}>()

const _size = refDefault(ref(props.size), '24px')

const border = computed(() => `calc(${get(_size)} / 6) solid currentColor`)

const { t } = useI18n()
</script>

<template>
  <span
    class="loader"
    :style="{
      width: _size,
      height: _size,
      border,
    }"
    :aria-label="t('loading')"
  ></span>
</template>

<style scoped>
.loader {
  border-bottom-color: transparent !important;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<i18n>
{
  "en": {
    "loading": "Content is loading."
  }
}
</i18n>
