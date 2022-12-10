<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { storeToRefs } from 'pinia'
import { watch, ref, computed, onMounted, Ref } from 'vue'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import {
  asyncComputed,
  get,
  set,
  useElementSize,
  useInfiniteScroll,
  useMediaQuery,
} from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { Lang, User } from '@hanas-app/api-helper'
import { useRoute } from 'vue-router'
import { size, isSmall, isLarge, isMedium } from '~/composables/device-size'
import { fallbackBannerLink } from '../../fallbackImages'
import { useHead } from '@vueuse/head'
import HButton from '~/components/input/HButton.vue'
import HTabbed from '~/components/HTabbed.vue'
import LangDetails from '~/components/profile/LangDetails.vue'
import UserDetails from '~/components/profile/UserDetails.vue'
import ShareButton from '~/components/ShareButton.vue'

const { t } = useI18n()
const route = useRoute()

/* Page state */
const hadError = ref(false)
const loading = ref(true)
const resolved = ref(false)

/* User info */
const user: Ref<User | null> = ref(null)
const userStore = useUserStore()
const { user: loggedInUser } = storeToRefs(userStore)
const viewingOwnProfile = computed(
  () =>
    get(loggedInUser)?.username === get(user)?.username && get(user)?.username
)

/* Language information */
const ownedLangsList: Ref<Lang[]> = ref([])
const collaboratedLangsList: Ref<Lang[]> = ref([])

const loadUser = async () => {
  set(ownedLangsList, [])
  set(collaboratedLangsList, [])
  const u = await client.users.get(route.params.username as string)

  if (u instanceof Error) {
    if (u.status === 404) {
    }
    return undefined
  } else {
    set(user, u)
  }
  set(loading, false)

  const ownedLangs = await u.ownedLangs()
  const collaboratedLangs = await u.collaboratedLangs()
  console.log(ownedLangs)
  if (!(ownedLangs instanceof Error)) {
    ownedLangsList.value.push(...ownedLangs.data)
  }

  if (!(collaboratedLangs instanceof Error)) {
    collaboratedLangsList.value.push(...collaboratedLangs.data)
  }
}

/* Banner and profile picture information */
const banner: Ref<HTMLDivElement | null> = ref(null)
const { width: bannerWidth } = useElementSize(banner)
const bannerHeight = computed(() => get(bannerWidth) / 3.65)
const bannerLink = computed(() => {
  const banner = get(user)?.banner
  if (banner) {
    return `url("${banner}")`
  } else {
    return `url("${fallbackBannerLink}")`
  }
})

const pfpContainer: Ref<HTMLDivElement | null> = ref(null)
const pfpSize = computed(() => get(bannerWidth) * (256 / 990))

/* Meta / head */
const pageTitle = computed(() => {
  const u = get(user)
  if (u) {
    if (u.displayName) {
      return `${u.displayName} (@${u.username}) | Hanas`
    } else {
      return `@${u.username} | Hanas`
    }
  } else {
    return `${t('view_profile')} | Hanas`
  }
})

const meta = (userProp: keyof User, ogProp: string) =>
  computed(() =>
    get(user)?.[userProp]
      ? {
          property: ogProp,
          content: get(user)?.[userProp],
        }
      : undefined
  )
useHead({
  meta: [
    {
      property: 'og:type',
      content: 'profile',
    },
    {
      property: 'og:title',
      content: pageTitle,
    },
    meta('profilePicture', 'og:image'),
    meta('gender', 'profile:gender'),
    meta('username', 'profile:username'),
  ],
  title: pageTitle,
})

const compressSelector = useMediaQuery('(max-width: 400px)')

const shareText = computed(() => {
  const u = get(user)
  if (u) {
    if (u.displayName) {
      return `${u.displayName} (@${u.username})`
    } else {
      return `@${u.username}`
    }
  } else {
    return t('view_profile')
  }
})

onMounted(loadUser)
watch(() => route.path, loadUser)
</script>

<template>
  <main
    class="mr-0 px-0 h-card vcard"
    :class="{
      'ml-0': isSmall,
    }"
  >
    <div v-if="user" :class="{ 'w-screen': isSmall }">
      <div
        class="banner w-full"
        :style="{
          height: bannerHeight + 'px',
          'background-image': bannerLink,
          'background-size': user.banner ? 'cover' : '',
        }"
        ref="banner"
      ></div>

      <div class="flex" :class="{ 'flex-row': isLarge, 'flex-col': !isLarge }">
        <div
          class="relative min-w-70 px-4 flex flex-col pb-4"
          :class="{ 'max-w-1/3': isLarge }"
        >
          <!-- pfp -->
          <div
            ref="pfpContainer"
            class="absolute -top-28 rounded-full bg-surface flex justify-center items-center pfp-container"
            :style="{
              height: pfpSize + 'px',
              width: pfpSize + 'px',
              top: `-${pfpSize / 2}px`,
            }"
          >
            <ProfilePicture
              :src="user.profilePicture"
              :username="user.username"
              class="u-photo h-9/10 w-9/10"
              disable-link
            />
          </div>
          <!-- display name -->
          <h1
            class="pb-2 flex flex-col"
            :style="{ 'padding-top': `${pfpSize / 2 + 8}px` }"
          >
            <span class="font-bold p-name fn text-xl" v-if="user.displayName">{{
              user.displayName
            }}</span>
            <span
              :class="{
                'font-bold text-xl': !user.displayName,
                'text-on-surface-variant font-light text-lg': user.displayName,
              }"
            >
              @<span
                class="p-nickname nickname"
                :class="{ 'p-name fn': !user.displayName }"
              >
                {{ user.username }}
              </span>
            </span>
          </h1>

          <!-- description -->
          <p
            class="break-words max-w-[60ch]"
            :class="{
              'text-on-surface-variant italic': !user.description,
            }"
          >
            {{
              user.description
                ? user.description
                : viewingOwnProfile
                ? t('missing_description_on_own_profile')
                : t('missing_description')
            }}
          </p>

          <!-- user actions -->
          <div class="flex flex-row pt-4">
            <span v-if="viewingOwnProfile">
              <HButton
                kind="outline"
                :content="t('edit_profile')"
                as="router-link"
                href="/edit-profile"
              >
                <mdi-pencil></mdi-pencil>
              </HButton>
            </span>
            <ShareButton :text="shareText" />
          </div>

          <UserDetails :user="user" />
        </div>

        <!-- langs -->
        <div
          class="flex flex-1 flex-col lang-detail-container"
          :class="{ 'max-w-2/3': isLarge }"
        >
          <HTabbed :compress="compressSelector">
            <template #tab-button-icon-1><mdi-account-star /></template>
            <template #tab-button-text-1>
              {{ t('owned_languages') }}
            </template>

            <template #tab-button-icon-2><mdi-account-group /></template>
            <template #tab-button-text-2>
              {{ t('collaborated_languages') }}
            </template>

            <template #tab-button-icon-3><mdi-heart /></template>
            <template #tab-button-text-3>
              {{ t('liked_languages') }}
            </template>

            <template #tab-content-1>
              <h3 class="compressed-title" v-if="compressSelector">
                {{ t('owned_languages.title') }}
              </h3>
              <LangDetails
                v-for="lang of ownedLangsList"
                :key="lang.code"
                :lang="lang"
              />
            </template>

            <template #tab-content-2>
              <h3 class="compressed-title" v-if="compressSelector">
                {{ t('collaborated_languages.title') }}
              </h3>
              <LangDetails
                v-for="lang of collaboratedLangsList"
                :key="lang.code"
                :lang="lang"
              />
            </template>

            <template #tab-content-3>
              <h3 class="compressed-title" v-if="compressSelector">
                {{ t('liked_languages.title') }}
              </h3>
              {{ t('coming_soon') }}
            </template>
          </HTabbed>
        </div>
      </div>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "view_profile": "View profile",
    "missing_description": "This user likes having an air of mystery about themselves.",
    "missing_description_on_own_profile": "You haven't set a description. Edit your profile to tell the world about yourself!",
    "edit_profile": "Edit profile",
    "coming_soon": "Coming soon!",

    "owned_languages": "Owned",
    "collaborated_languages": "Collaborated",
    "liked_languages": "Liked",

    "owned_languages.title": "Owned languages",
    "collaborated_languages.title": "Collaborated languages",
    "liked_languags.title": "Liked languages"
  }
}
</i18n>

<style scoped>
.compressed-title {
  @apply text-2xl leading-tight mx-2 mb-2;
}

.banner {
  background-color: #3b3f44;
}
</style>

<style>
.pfp-container img {
  @apply h-full w-full;
}
</style>
