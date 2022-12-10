<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'
import { notif } from '~/notif'

const { t } = useI18n()

const props = defineProps<{
  text: string
}>()

const showSnackbar = (text: string) => notif(t(text))

const share = () => {
  const shareData = {
    title: 'Hanas',
    text: props.text,
    url: window.location + '',
  }
  const shareText = `${props.text} ${t('on_hanas')}: ${window.location}`
  if ('share' in navigator && navigator.canShare(shareData)) {
    navigator
      .share(shareData)
      .then(() => {
        showSnackbar('share_success')
      })
      .catch((e) => {
        console.error("couldn't share page")
        showSnackbar('share_failure')
      })
  } else if ('clipboard' in navigator) {
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        showSnackbar('copy_success')
      })
      .catch((e) => {
        console.error("couldn't write to clipboard: ", e)
        showSnackbar('copy_failure')
      })
  } else {
    try {
      // use execCommand to copy the link to the clipboard if no modern apis
      // are available
      // https://stackoverflow.com/a/30810322
      const textArea = document.createElement('textarea')

      textArea.value = shareText

      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'

      document.body.appendChild(textArea)

      const lastFocused = document.activeElement
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      if (!success) {
        console.error("couldn't write to clipboard")
        showSnackbar('copy_failure')
      } else {
        showSnackbar('copy_success')
      }
      document.body.removeChild(textArea)
      // @ts-ignore
      lastFocused.focus()
    } catch (e) {
      console.error("couldn't write to clipboard: ", e)
      showSnackbar('copy_failure')
    }
  }
}
</script>

<template>
  <button
    aria-label="Share this page"
    class="h-10 w-10 flex justify-center items-center rounded-full interactable-bg-surface"
    @click="share"
  >
    <mdi-share-variant-outline class="h-6 w-6" />
  </button>
</template>

<style scoped>
button:active svg {
  @apply text-primary;
}
</style>

<i18n>
{
  "en": {
    "on_hanas": "on Hanas",
      "share_success": "Successfully shared",
      "copy_success": "Copied URL to clipboard",

      "share_failure": "Couldn't share page :-(",
      "copy_failure": "Couldn't copy URL to clipboard :-(",

      "share_unavailable": "Sharing is unavailable in this browser :-("
  }
}
</i18n>
