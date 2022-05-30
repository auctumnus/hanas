<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from 'petite-vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: route.meta.title
    ? t(route.meta.title as string) + ' | Hanas'
    : 'Hanas',
  meta: [{ name: 'description', content: 'Conlanging tool and community' }],
})
</script>

<template>
  <router-view />
</template>
