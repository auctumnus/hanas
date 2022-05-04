<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

import { useI18n } from 'petite-vue-i18n'
import { useUserStore } from '~/stores/user'
const { t } = useI18n()

const user = useUserStore()
</script>

<template>
  <Menu>
    <MenuButton>
      <ProfilePicture
        :src="user.profilePicture"
        size="md"
        aria-label="Open user menu"
      />
    </MenuButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="z-15 absolute right-0 top-0 origin-top-right w-56 shadow-lg bg-surface-light dark:bg-surface-dark"
      >
        <h1
          class="h-16 flex flex-row items-center justify-end select-none px-4 py-2"
        >
          {{ t('greeting') }},&nbsp;<b>{{ user.displayName }}</b
          >! <ProfilePicture :src="user.profilePicture" size="md" aria-hidden />
        </h1>
        <MenuItem v-slot="{ active }">
          <router-link
            :to="`/users/${user.username}`"
            class="interactable-bg-surface-light dark:interactable-bg-surface-dark flex flex-row items-center px-3 py-3 gap-3 h-12"
            :class="{
              '!bg-on-surface-light/12 !dark:bg-on-surface-dark/12': active,
            }"
          >
            <mdi-account-outline /> <span>{{ t('user_profile') }}</span>
          </router-link>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <button
            @click="console.log('logged out')"
            class="interactable-bg-surface-light dark:interactable-bg-surface-dark flex flex-row items-center px-3 py-3 gap-3 h-12 w-full font-normal"
            :class="{
              '!bg-on-surface-light/12 !dark:bg-on-surface-dark/12': active,
            }"
          >
            <mdi-hand-wave-outline /> <span>{{ t('log_out') }}</span>
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<i18n>
{
    "en": {
        "greeting": "hi",
        "user_profile": "Your profile",
        "log_out": "Log out"
    },
    "es": {
        "greeting": "¡hola",
        "user_profile": "Tu perfil",
        "log_out": "Cerrar tu sesión"
    }
}
</i18n>
