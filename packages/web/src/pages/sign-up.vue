<script setup lang="ts">
import { isKratosError } from '@hanas-app/api-helper'
import { get, set, useToggle } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import { isHuge } from '../composables/device-size'

const { t } = useI18n()
const username = ref('')
const email = ref('')
const password = ref('')

const [viewPassword, toggleViewPassword] = useToggle(false)

const router = useRouter()

onMounted(() => {
  if (client.isLoggedIn) {
    router.back()
  }
})

const isSubmitting = ref(false)

const overallError = ref('')

const errors = reactive({
  username: {
    showError: false,
    errorMessage: '',
  },
  password: {
    showError: false,
    errorMessage: '',
  },
  email: {
    showError: false,
    errorMessage: '',
  },
})

const clearError = (field: keyof typeof errors) => {
  errors[field].showError = false
  errors[field].errorMessage = ''
}

const setError = (field: keyof typeof errors, message: string) => {
  errors[field].showError = true
  errors[field].errorMessage = message
}

const clearErrors = () =>
  Object.keys(errors).forEach((k) => clearError(k as keyof typeof errors))

const userStore = useUserStore()

// https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
// "This requirement is a willful violation of RFC 5322"; thus, this isn't technically
// applicable to _all_ emails, so don't prevent a user from submitting it anyway
// just useful for
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const isValidEmail = computed(() =>
  get(email) ? emailRegex.test(get(email)) : true
)

const usernameRegex = /^([a-z0-9](-|_)?)+[a-z0-9]$/
const isValidUsername = computed(() => {
  const u = get(username)
  if (!u) {
    return true
  } else if (u.length < 2 || u.length > 30) {
    return false
  } else {
    return usernameRegex.test(u)
  }
})
const usernameValidityIssue = computed(() => {
  const u = get(username)
  if (u.length < 2) {
    return 'username_too_short'
  } else if (u.length > 30) {
    return 'username_too_long'
  } else if (/__|_-|-_|--/.test(u)) {
    return 'username_consecutive_hyphens'
  } else if (/[A-Z]/.test(u)) {
    return 'username_uppercase'
  } else if (/[ -,\.\/:-@\[-^`{-~}]/.test(u)) {
    return 'username_punctuation'
  } else if (/^_|_$|-$|$-/.test(u)) {
    return 'username_affixed_hyphens'
  } else {
    return 'username_invalid'
  }
})

const signup = async () => {
  if (!get(username)) {
    setError('username', 'missing_username')
  }
  if (!get(email)) {
    setError('email', 'missing_email')
  }
  if (!get(password)) {
    setError('password', 'missing_password')
  }

  if (get(isSubmitting) || !(get(username) && get(email) && get(password)))
    return undefined

  try {
    clearErrors()
    set(isSubmitting, true)

    await client.register(get(email), get(username), get(password))
    userStore.replaceUser(await client.currentUser())

    set(isSubmitting, false)
    router.back()
  } catch (e) {
    console.error(e)
    set(overallError, e + '')
    if (isKratosError(e)) {
      console.error(e)
    }
  }
}
</script>

<template>
  <main class="flex flex-col items-center ml-0 mr-0 !max-w-screen">
    <form class="flex flex-col gap-4 items-center" @submit.prevent="signup()">
      <h2 class="text-3xl font-semibold mt-4 mb-4">
        {{ t('signup') }}
      </h2>

      <HInput
        name="username"
        class="w-300px"
        type="filled"
        @input="clearError('username')"
        :label="t('username')"
        v-model="username"
        :has-error="errors.username.showError || !isValidUsername"
        :has-helper="errors.username.showError || !isValidUsername"
      >
        <template #prepended>
          <mdi-account class="w-6 h-6" />
        </template>
        <template #appended> &nbsp; </template>
        <template #helper v-if="errors.username.showError">
          {{ t(errors.username.errorMessage) }}
        </template>
        <template #helper v-else-if="!isValidUsername">
          {{ t(usernameValidityIssue) }}
        </template>
      </HInput>

      <HInput
        name="email"
        class="w-300px"
        type="filled"
        @input="clearError('email')"
        input-type="email"
        :label="t('email')"
        v-model="email"
        :has-error="errors.email.showError || !isValidEmail"
        :has-helper="errors.email.showError || !isValidEmail"
      >
        <template #prepended>
          <mdi-at class="w-6 h-6" />
        </template>
        <template #appended> &nbsp; </template>
        <template #helper v-if="errors.email.showError">
          {{ t(errors.email.errorMessage) }}
        </template>
        <template #helper v-else-if="!isValidEmail">
          {{ t('invalid_email') }}
        </template>
      </HInput>

      <HInput
        name="password"
        class="w-300px"
        type="filled"
        @input="clearError('password')"
        :input-type="viewPassword ? 'text' : 'password'"
        :label="t('password')"
        v-model="password"
        has-helper
        :has-error="errors.password.showError"
      >
        <template #prepended>
          <mdi-key class="w-6 h-6" />
        </template>
        <template #appended>
          <button
            @click.stop="toggleViewPassword()"
            label="Toggle viewing of password"
            class="flex flex-col justify-center"
          >
            <mdi-eye-off class="w-6 h-6 cursor-pointer" v-if="viewPassword" />
            <mdi-eye class="w-6 h-6 cursor-pointer" v-else />
          </button>
        </template>
        <template #helper>
          <a
            v-if="!errors.password.showError"
            class="link"
            href="https://www.cisa.gov/uscert/ncas/tips/ST04-002"
            >{{ t('password_help_text') }}</a
          >
          <span v-else>{{ t(errors.password.errorMessage) }}</span>
        </template>
      </HInput>

      {{ overallError }}

      <HButton class="w-40" kind="filled" :content="t('signup')" />

      <hr
        class="text-on-surface-variant-light dark:text-on-surface-variant-dark transition-all border mb-4 mt-6"
        :class="{ 'w-1/3': isHuge, 'w-1/2': !isHuge }"
      />

      <span
        >{{ t('login_text') }}
        <router-link to="sign-in" class="link">{{
          t('login')
        }}</router-link></span
      >
    </form>
  </main>
</template>

<i18n>
{
    "en": {
        "login_text": "Already have an account?",
        "login": "Sign in",
        "signup": "Sign up",
        "username": "Username",
        "email": "E-mail",
        "password": "Password",
        "password_help_text": "Follow strong password guidelines!",

        "invalid_email": "This doesn't look like a valid email.",

        "username_invalid": "Username can only contain a-z, 0-9, underscores, and hyphens.",
        "username_consecutive_hyphens": "Username cannot contain consecutive hyphens or underscores.",
        "username_punctuation": "Username cannot contain punctuation other than hyphens and underscores.",
        "username_too_long": "Username must be under 30 characters.",
        "username_too_short": "Username must be at least 2 characters.",
        "username_uppercase": "Username must be lowercase.",
        "username_affixed_hyphens": "Username can't have underscores or hyphens at the start or end."
    },
    "es": {
        "login_text": "¿Ya tienes una cuenta?",
        "login": "Iniciar sesión",
        "username": "Nombre de usuario",
        "email": "E-mail",
        "password": "Contraseña",
        "signup": "Regístrate",
        "password_help_text": "¡Sígue directrices seguras para contraseñas!"
    }

}
</i18n>
