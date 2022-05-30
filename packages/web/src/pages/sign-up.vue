<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { ref } from 'vue'
import { isHuge } from '../composables/device-size'

const { t } = useI18n()
const username = ref('')
const email = ref('')
const password = ref('')

const [viewPassword, toggleViewPassword] = useToggle(false)
</script>

<template>
  <main class="flex flex-col gap-4 ml-0 mr-0 items-center !max-w-screen">
    <h2 class="text-3xl font-semibold mt-4 mb-4">
      {{ t('signup') }}
    </h2>

    <HInput
      name="username"
      class="w-300px"
      type="outlined"
      :label="t('username')"
      v-model="username"
    >
      <template #prepended>
        <mdi-account class="w-6 h-6" />
      </template>
      <template #appended> &nbsp; </template>
    </HInput>

    <HInput
      name="email"
      class="w-300px"
      type="outlined"
      input-type="email"
      :label="t('email')"
      v-model="email"
    >
      <template #prepended>
        <mdi-at class="w-6 h-6" />
      </template>
      <template #appended> &nbsp; </template>
    </HInput>

    <HInput
      name="password"
      class="w-300px"
      type="outlined"
      :helper="t('password_help_text')"
      :input-type="viewPassword ? 'text' : 'password'"
      :label="t('password')"
      v-model="password"
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
    </HInput>

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
        "password_help_text": "Follow strong password guidelines!"
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
