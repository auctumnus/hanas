<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { storeToRefs } from 'pinia'
import { ref, Ref } from 'vue'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'

const emit = defineEmits<{
  (
    e: 'error',
    error: Extract<
      Awaited<
        | ReturnType<typeof client.users.uploadBanner>
        | ReturnType<typeof client.users.deleteBanner>
      >,
      Error
    >
  ): any
}>()

const { t } = useI18n()

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

const bannerIsUploading = ref(false)
const bannerInput: Ref<HTMLInputElement | null> = ref(null)

const upload = () => {
  get(bannerInput)?.click()
}

const submitBanner = async (file: File | null) => {
  if (!file) return undefined
  set(bannerIsUploading, true)

  const response = await client.users.uploadBanner(file, get(user)!.username)
  if (response instanceof Error) {
    emit('error', response)
  } else {
    const { url } = response
    user.value!.profilePicture = url
  }
  set(bannerIsUploading, false)
}

const remove = async () => {
  const response = await client.users.deleteBanner(get(user)!.username)
  if (response instanceof Error) {
    emit('error', response)
  } else {
    user.value!.profilePicture = ''
  }
}
</script>

<template>
  <div class="flex flex-row">
    <img class="h-32" :src="user?.banner" />
    <div class="flex flex-col justify-center gap-2">
      <input
        type="file"
        class="hidden"
        id="banner-input"
        name="banner"
        ref="bannerInput"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        @change="submitBanner(bannerInput?.files?.[0] || null)"
      />
      <HButton
        kind="filled"
        @click="upload()"
        :content="t(bannerIsUploading ? 'uploading' : 'button.banner_upload')"
        :aria-label="
          t(bannerIsUploading ? 'uploading' : 'button.banner_upload_full')
        "
        :disabled="bannerIsUploading"
      >
        <Spinner v-if="bannerIsUploading" size="16px" class="mr-1" />
        <mdi-upload v-else />
      </HButton>
      <HButton
        kind="filled tonal"
        @click="remove()"
        :content="t('button.banner_remove')"
        :aria-label="t('button.banner_remove_full')"
        :disabled="bannerIsUploading"
      >
        <mdi-close />
      </HButton>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "button.banner_upload": "Upload",
    "button.banner_upload_full": "Upload a banner image",
    "button.banner_remove": "Remove",
    "button.banner_remove_full": "Remove your banner image",
    "uploading": "Uploading...",
    "banner": "Your banner"
  },
  "es": {
    "button.banner_upload": "Subir",
    "button.banner_upload_full": "Subir un cartel de perfil",
    "button.banner_remove": "Quitar",
    "button.banner_remove_full": "Quitar tu cartel de perrfil",
    "uploading": "Subiendo...",
    "banner": "Tu cartel de perfil"
  }
}
</i18n>
