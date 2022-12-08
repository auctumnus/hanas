<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import HButton from '~/components/input/HButton.vue'
import HMenuButton from './menu/HMenuButton.vue'

const { t } = useI18n({ useScope: 'global' })

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

const route = useRoute()
const router = useRouter()

defineEmits<{
  (event: 'menu-closed'): void
  (event: 'menu-opened'): void
}>()
</script>

<template>
  <header
    class="fixed z-5 top-0 left-0 flex row justify-between items-center px-4 py-2 h-16 w-full bg-surface"
  >
    <HMenuButton
      @menu-closed="$emit('menu-closed')"
      @menu-opened="$emit('menu-opened')"
    />
    <h1 class="text-xl text-on-surface">
      {{ route.meta.title ? t(route.meta.title as string) : 'Hanas' }}
    </h1>
    <HButton
      @click="router.push('/sign-in')"
      kind="outline"
      :content="t('button.login')"
      class="absolute right-4 top-3"
      v-if="user === null"
    />
    <div class="w-12" v-if="user === null">&nbsp;</div>
    <UserMenu v-else />
  </header>
</template>
