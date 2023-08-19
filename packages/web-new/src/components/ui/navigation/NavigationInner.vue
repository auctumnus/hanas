<script setup lang="ts">
import HomeButton from './HomeButton.vue'
import LanguagesButton from './LanguagesButton.vue'
import InvitesButton from './InvitesButton.vue'
import UsersButton from './UsersButton.vue'

import { isLoggedIn } from '@/user'
</script>

<template>
  <home-button />
  <languages-button />
  <invites-button v-if="isLoggedIn" />
  <users-button />
</template>
