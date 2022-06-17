<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { storeToRefs } from 'pinia'
import { onMounted, Ref, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'

const { t } = useI18n()

const userStore = useUserStore()

const user = storeToRefs(userStore)

// @ts-ignore
console.log(user)

// @ts-ignore
const { profilePicture } = toRefs(user.user) as {
  profilePicture: Ref<string | null>
}

onMounted(() => {
  if (!user) {
    useRouter().push('/sign-in')
  }
})

const pfp: Ref<HTMLImageElement | null> = ref(null)

const pfpInput: Ref<HTMLInputElement | null> = ref(null)

const upload = () => {
  get(pfpInput)?.click()

  /*const pfp = get(profilePicture)
  if (!pfp) return undefined
  client.users.uploadProfilePicture(pfp, get(user)!.username)*/
}

const submitPfp = async (file: File | null) => {
  if (!file) return undefined
  set(pfpIsUploading, true)
  const { url } = await client.users.uploadProfilePicture(
    file,
    get(user.user)!.username
  )
  set(pfpIsUploading, false)
  set(profilePicture, url as string)
}

const remove = () => {
  client.users.deleteProfilePicture(get(user)!.username)
}

const pfpIsUploading = ref(false)
</script>

<template>
  <main>
    <div class="flex flex-row">
      <ProfilePicture class="h-32 w-32" :src="user?.profilePicture" ref="pfp" />
      <div class="flex flex-col justify-center gap-2">
        <input
          type="file"
          class="hidden"
          id="pfp-input"
          name="profilePicture"
          ref="pfpInput"
          accept="image/jpeg, image/png, image/jpg, image/webp"
          @change="submitPfp(pfpInput?.files?.[0] || null)"
        />
        <HButton
          kind="filled"
          @click="upload()"
          :content="t(pfpIsUploading ? 'uploading' : 'button.pfp_upload')"
          :aria-label="
            t(pfpIsUploading ? 'uploading' : 'button.pfp_upload_full')
          "
          :disabled="pfpIsUploading"
        >
          <Spinner v-if="pfpIsUploading" size="16px" class="mr-1" />
          <mdi-upload v-else />
        </HButton>
        <HButton
          kind="filled tonal"
          @click="remove()"
          :content="t('button.pfp_remove')"
          :aria-label="t('button.pfp_remove_full')"
          :disabled="pfpIsUploading"
        >
          <mdi-close />
        </HButton>
      </div>
    </div>
    <label>
      profile pic
      <!--<input
        type="file"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        @change="profilePicture = pfpInput?.files?.[0] || null"
        ref="pfpInput"
      />-->
    </label>
  </main>
</template>

<i18n>
{
  "en": {
    "button.pfp_upload": "Upload",
    "button.pfp_upload_full": "Upload a profile picture",
    "button.pfp_remove": "Remove",
    "button.pfp_remove_full": "Remove your profile picture",
    "uploading": "Uploading..."
  },
  "es": {
    "button.pfp_upload": "Subir",
    "button.pfp_upload_full": "Subir un foto de perfil",
    "button.pfp_remove": "Quitar",
    "button.pfp_remove_full": "Quitar tu foto de perfil",
    "uploading": "Subiendo..."
  }
}
</i18n>

<route lang="yaml">
meta:
  title: 'route.edit_profile'
</route>
