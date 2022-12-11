<script setup lang="ts">
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { User } from '@hanas-app/api-helper'
import { useI18n } from 'petite-vue-i18n'
import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

const { user: loggedInUser } = storeToRefs(userStore)

const userIsLoggedIn = !!loggedInUser.value

const { t } = useI18n()

defineProps<{ user: User }>()
</script>

<template>
  <PopupMenu>
    <template #menu-button>
      <IconButton label="User actions">
        <mdi-dots-horizontal />
      </IconButton>
    </template>
    <template #content>
      <PopupMenuItem :content="t('user_actions.block')" v-if="userIsLoggedIn">
        <template #icon><mdi-block-helper /></template>
      </PopupMenuItem>

      <PopupMenuItem :content="t('user_actions.report')">
        <template #icon><mdi-alert-outline /></template>
      </PopupMenuItem>
    </template>
  </PopupMenu>
</template>

<i18n>
{
  "en": {
    "user_actions.block": "Block user",
    "user_actions.report": "Report user"
  }
}
</i18n>
