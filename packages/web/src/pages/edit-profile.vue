<script setup lang="ts">
import { debouncedWatch, get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useValidation } from '~/composables/validation'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import {
  getIsValidUsername,
  getUsernameValidityIssue,
} from '~/userInfoValidity'

const { t } = useI18n()

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

const username = useValidation(ref(''), (u) => {
  if (!u) return true
  if (!getIsValidUsername(u)) return getUsernameValidityIssue(u)
})

// check if username is taken
const checkingUsernameTaken = ref(false)
const isUsernameTaken = ref(false)
debouncedWatch(
  username.ref,
  async (u) => {
    if (!u || get(username.hasValidationError) || u === get(user)?.username) {
      return
    }
    set(checkingUsernameTaken, true)
    try {
      await client.users.get(u)
      // if no 404, username is taken
      username.setError('username_taken')
      set(isUsernameTaken, true)
    } catch (e) {
      username.clearError()
      set(isUsernameTaken, false)
    }
    setTimeout(() => set(checkingUsernameTaken, false), 100)
  },
  { debounce: 300 }
)

// vue moment
const {
  ref: usernameRef,
  hasError: usernameHasError,
  errorMessage: usernameErrorMessage,
} = username

const clean = (s: string) => s.trim().split(/\s+/).join(' ')

const displayName = useValidation(ref(''), (displayName) => {
  if (!displayName) {
    return true
  } else if (clean(displayName).length < 2) {
    return 'display_name_too_short'
  } else if (clean(displayName).length > 32) {
    return 'display_name_too_long'
  } else {
    return true
  }
})

const {
  ref: displayNameRef,
  hasError: displayNameHasError,
  errorMessage: displayNameErrorMessage,
} = displayName

const description = useValidation(ref(''), (description) => {
  if (!description) {
    return true
  } else if (clean(description).length > 1000) {
    return 'description_too_long'
  } else {
    return true
  }
})

const {
  ref: descriptionRef,
  hasError: descriptionHasError,
  errorMessage: descriptionErrorMessage,
} = description

const gender = useValidation(ref(''), (gender) => {
  if (!gender) {
    return true
  } else if (!gender.match(/^([a-fA-F0-9]{3}){1,2}$/)) {
    return 'gender_invalid'
  } else {
    return true
  }
})

const {
  ref: genderRef,
  hasError: genderHasError,
  errorMessage: genderErrorMessage,
} = gender

const pronouns = useValidation(ref(''), (pronouns) => {
  if (!pronouns) {
    return true
  } else if (clean(pronouns).length < 2) {
    return 'pronouns_too_short'
  } else if (clean(pronouns).length > 32) {
    return 'pronouns_too_long'
  } else {
    return true
  }
})

const {
  ref: pronounsRef,
  hasError: pronounsHasError,
  errorMessage: pronounsErrorMessage,
} = pronouns

onMounted(() => {
  const u = get(user)
  if (!u) {
    useRouter().push('/sign-in')
  } else {
    const { username, displayName, description, pronouns, gender } = u

    set(usernameRef, username)
    set(displayNameRef, displayName || '')
    set(descriptionRef, description || '')
    set(pronounsRef, pronouns || '')
    set(genderRef, gender || '')
  }
})

const isSubmitting = ref(false)

const updateUser = async () => {
  const currentUsername = get(user)!.username
  const username = get(usernameRef)
  const displayName = get(displayNameRef)
  const description = get(descriptionRef)
  const pronouns = get(pronounsRef)
  const gender = get(genderRef)

  const updateInfo = {} as Parameters<typeof client.users.update>[0]

  // TODO: this is gross i hate it
  if (username) {
    updateInfo.username = username
  }
  if (displayName) {
    updateInfo.displayName = displayName
  }
  if (description) {
    updateInfo.description = description
  }
  if (pronouns) {
    updateInfo.pronouns = pronouns
  }
  if (gender) {
    updateInfo.gender = gender
  }

  try {
    set(isSubmitting, true)
    const newUser = await client.users.update(updateInfo, currentUsername)
    console.log(newUser)
    userStore.replaceUser(newUser)
  } catch (e) {
    console.error(e)
  }
  set(isSubmitting, false)
}
</script>

<template>
  <main>
    <EditProfilePicture />

    <form @submit.prevent="updateUser()" class="flex flex-col gap-4 mt-4">
      <div class="flex flex-row gap-4 w-full">
        <HInput
          type="filled"
          :label="t('username')"
          name="username"
          v-model="usernameRef"
          :has-error="usernameHasError"
          :min-length="2"
          :max-length="30"
        >
          <template #appended v-if="checkingUsernameTaken">
            <Spinner />
          </template>
          <template #helper v-if="usernameHasError">
            {{ t(usernameErrorMessage) }}
          </template>
          <template #helper v-else-if="checkingUsernameTaken">
            {{ t('checking_username_taken') }}
          </template>
        </HInput>

        <HInput
          type="filled"
          :label="t('display_name')"
          v-model="displayNameRef"
          name="display-name"
          :has-error="displayNameHasError"
          :min-length="2"
          :max-length="32"
        >
          <template #helper v-if="displayNameHasError">
            {{ t(displayNameErrorMessage) }}
          </template>
        </HInput>
      </div>

      <div class="flex flex-row gap-4 w-full">
        <HInput
          type="filled"
          :label="t('gender')"
          v-model="genderRef"
          name="gender"
          :has-error="genderHasError"
          :max-length="6"
        >
          <template #helper v-if="genderHasError">
            {{ t(genderErrorMessage) }}
          </template>
        </HInput>

        <HInput
          type="filled"
          :label="t('pronouns')"
          v-model="pronounsRef"
          name="pronouns"
          :has-error="pronounsHasError"
          :min-length="2"
          :max-length="15"
        >
          <template #helper v-if="pronounsHasError">
            {{ t(pronounsErrorMessage) }}
          </template>
        </HInput>
      </div>

      <HInput
        type="filled"
        :label="t('description')"
        v-model="descriptionRef"
        name="description"
        :has-error="descriptionHasError"
        :max-length="1000"
        multiline
      >
        <template #helper v-if="descriptionHasError">
          {{ t(descriptionErrorMessage) }}
        </template>
      </HInput>

      <HButton
        class="transition-all w-40"
        kind="filled"
        :disabled="isSubmitting"
        :content="isSubmitting ? '' : t('save')"
        :label="isSubmitting ? 'Loading' : ''"
      >
        <Spinner v-if="isSubmitting" />
      </HButton>
    </form>
  </main>
</template>

<i18n>
{
  "en": {
    "username": "Username",
    "username_invalid": "Username can only contain a-z, 0-9, underscores, and hyphens.",
      "username_consecutive_hyphens": "Username cannot contain consecutive hyphens or underscores.",
      "username_punctuation": "Username cannot contain punctuation other than hyphens and underscores.",
      "username_too_long": "Username must be under 30 characters.",
      "username_too_short": "Username must be at least 2 characters.",
      "username_uppercase": "Username must be lowercase.",
      "username_affixed_hyphens": "Username can't have underscores or hyphens at the start or end.",

      "username_taken": "This username is not available.",
      "checking_username_taken": "Checking if the username is available...",

      "display_name": "Display name",
      "display_name_too_long": "Display name must be under 32 characters.",
      "display_name_too_short": "Display name must be at least 2 characters.",

      "description": "Description",
      "description_too_long": "Description must be under 1000 characters.",
      
      "gender": "Gender",
      "gender_invalid": "Gender must be a hex color code.",

      "pronouns": "Pronouns",
      "pronouns_too_long": "Pronouns must be under 15 characters.",
      "pronouns_too_short": "Pronouns must be at least 2 characters.",

      "save": "Save"
  },
  "es": {

  }
}
</i18n>

<route lang="yaml">
meta:
  title: 'route.edit_profile'
</route>
