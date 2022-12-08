<script setup lang="ts">
import { isKratosError } from '@hanas-app/api-helper'
import { get, set, useToggle } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import { isHuge } from '../composables/device-size'

const { t } = useI18n()
const username = ref('')
const password = ref('')

const hasError = ref(false)

const lastError = ref('')

const isSubmitting = ref(false)

const [viewPassword, toggleViewPassword] = useToggle(false)

const usernameHelper = ref('')
const showErrorOnUsername = ref(false)
const clearUsernameError = () => {
  set(showErrorOnUsername, false)
  set(usernameHelper, '')
}

const passwordHelper = ref('')
const showErrorOnPassword = ref(false)
const clearPasswordError = () => {
  set(showErrorOnPassword, false)
  set(passwordHelper, '')
}

const router = useRouter()

onMounted(() => {
  if (client.isLoggedIn) {
    router.back()
  }
})

const userStore = useUserStore()

const login = async () => {
  if (!get(username)) {
    set(showErrorOnUsername, true)
    set(usernameHelper, 'missing_username')
  }
  if (!get(password)) {
    set(showErrorOnPassword, true)
    set(passwordHelper, 'missing_password')
  }
  if (get(isSubmitting) || !(get(username) && get(password))) return undefined
  try {
    set(hasError, false)
    clearUsernameError()
    clearPasswordError()
    set(isSubmitting, true)

    await client.login(get(username), get(password))
    userStore.replaceUser(await client.currentUser())

    set(isSubmitting, false)
    router.back()
  } catch (e) {
    if (isKratosError(e)) {
      if (e.id === 4000006) {
        set(lastError, 'bad_credentials')
      }
    } else if (e instanceof Error) {
      set(lastError, `unexpected error: ${e.message} (check the js console)`)
      console.error(e)
    } else {
      set(lastError, `unexpected malformed error (check the js console)`)
      console.error(e)
    }
    set(hasError, true)
    set(showErrorOnUsername, true)
    set(showErrorOnPassword, true)
    set(isSubmitting, false)
  }
}
</script>

<template>
  <main class="flex flex-col items-center ml-0 mr-0 !max-w-screen">
    <form class="flex flex-col gap-4 items-center" @submit.prevent="login()">
      <h2 class="text-3xl font-semibold mt-4 mb-4">
        {{ t('login') }}
      </h2>

      <HInput
        name="username"
        class="w-300px"
        type="filled"
        :label="t('username_or_email')"
        v-model="username"
        :has-error="showErrorOnUsername"
        @input="clearUsernameError()"
        :min-length="1"
        :has-helper="!!usernameHelper"
        autocomplete="email"
      >
        <template #prepended>
          <mdi-account class="w-6 h-6" />
        </template>
        <template #appended> &nbsp; </template>
        <template #helper>{{
          usernameHelper ? t(usernameHelper) : ''
        }}</template>
      </HInput>

      <HInput
        name="password"
        class="w-300px"
        type="filled"
        :input-type="viewPassword ? 'text' : 'password'"
        :label="t('password')"
        v-model="password"
        :has-error="showErrorOnPassword"
        @input="clearPasswordError()"
        :min-length="1"
        :helper="passwordHelper ? t(passwordHelper) : ''"
        :has-helper="!!passwordHelper"
        autocomplete="current-password"
      >
        <template #prepended>
          <mdi-key class="w-6 h-6" />
        </template>
        <template #appended>
          <button
            @click.stop="toggleViewPassword()"
            label="Toggle viewing of password"
            class="flex flex-col justify-center"
            type="button"
          >
            <mdi-eye-off class="w-6 h-6 cursor-pointer" v-if="viewPassword" />
            <mdi-eye class="w-6 h-6 cursor-pointer" v-else />
          </button>
        </template>
        <template #helper>{{
          passwordHelper ? t(passwordHelper) : ''
        }}</template>
      </HInput>

      <router-link to="forgot-password" class="link">
        {{ t('forgot_password') }}
      </router-link>

      <HButton
        class="transition-all"
        :class="{
          'w-40': !isSubmitting,
        }"
        kind="filled"
        :disabled="isSubmitting"
        :content="isSubmitting ? '' : t('login')"
        :label="isSubmitting ? 'Loading' : ''"
      >
        <Spinner v-if="isSubmitting" />
      </HButton>

      <span v-if="hasError">
        {{ t(lastError) }}
      </span>
    </form>

    <hr
      class="text-on-surface-variant transition-all border mb-4 mt-6"
      :class="{ 'w-1/3': isHuge, 'w-1/2': !isHuge }"
    />

    <span
      >{{ t('sign_up_text') }}
      <router-link to="sign-up" class="link">{{
        t('signup')
      }}</router-link></span
    >
  </main>
</template>

<i18n>
{
    "en": {
        "login": "Sign in",
        "signup": "Sign up",
        "username_or_email": "Username or e-mail",
        "password": "Password",
        "forgot_password": "Forgot your password?",
        "sign_up_text": "Don't have an account?",
        "bad_credentials": "Incorrect username or password.",
        "missing_username": "Input a username or email.",
        "missing_password": "Input a password."
    },
    "es": {
        "login": "Iniciar sesión",
        "username_or_email": "Nombre de usuario o email",
        "password": "Contraseña",
        "forgot_password": "¿Olvidaste tu contraseña?",
        "sign_up_text": "¿No tienes una cuenta?",
        "signup": "Regístrate",
        "bad_credentials": "Tu nombre de usuario o tu email es incorrecto.",
        "missing_username": "Introduce tu nombre de usuario o tu email.",
        "missing_password": "Introduce tu contraseña."
    }
}
</i18n>

<style>
input#password {
  @apply font-mono;
}
</style>
