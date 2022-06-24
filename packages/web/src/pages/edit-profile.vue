<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { storeToRefs } from 'pinia'
import { computed, onMounted, Ref, ref } from 'vue'
import { useRouter } from 'vue-router'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import {
  getIsValidUsername,
  getUsernameValidityIssue,
} from '~/userInfoValidity'

const { t } = useI18n()

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

onMounted(() => {
  if (!user) {
    useRouter().push('/sign-in')
  }
})

const updateUser = async () => {}

const inputs = ref({
  username: {
    value: '',
    errorMessage: '',
  },
})

const validity = {
  username: {
    hasValidityError: computed(() =>
      getIsValidUsername(get(inputs).username.value)
    ),
    errorMessage: computed(() =>
      getUsernameValidityIssue(get(inputs).username.errorMessage)
    ),
  },
}
</script>

<template>
  <main>
    <EditProfilePicture />

    <form @submit.prevent="updateUser()">
      <HInput
        type="filled"
        label="Username"
        name="username"
        v-model="inputs.username.value"
      />
    </form>
  </main>
</template>

<i18n>
{
  "en": {

  },
  "es": {

  }
}
</i18n>

<route lang="yaml">
meta:
  title: 'route.edit_profile'
</route>
