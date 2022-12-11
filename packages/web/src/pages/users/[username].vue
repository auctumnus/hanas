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
import UserActionsMenu from '~/components/profile/UserActionsMenu.vue'

const { t } = useI18n()
const route = useRoute()

/* Page state */
const hadError = ref(false)
const errorStatus: Ref<404 | 500 | null> = ref(null)
const loading = ref(true)

/* User info */
const user: Ref<User | null> = ref(null)
const userStore = useUserStore()
const { user: loggedInUser } = storeToRefs(userStore)
const viewingOwnProfile = computed(
  () =>
    get(loggedInUser)?.username === get(user)?.username && get(user)?.username
)

type olp = Ref<Awaited<ReturnType<User['ownedLangs']>> | null>
type clp = Ref<Awaited<ReturnType<User['collaboratedLangs']>> | null>

/* Language information */
let ownedLangsPaginator: olp = ref(null)
let collaboratedLangsPaginator: clp = ref(null)

const ownedLangsList: Ref<Lang[]> = ref([])
const collaboratedLangsList: Ref<Lang[]> = ref([])

const loadUser = async () => {
  set(ownedLangsList, [])
  set(collaboratedLangsList, [])
  const u = await client.users.get(route.params.username as string)

  if (u instanceof Error) {
    set(hadError, true)
    set(errorStatus, u.status)
    return undefined
  } else {
    set(user, u)
  }

  const ownedLangs = await u.ownedLangs()
  const collaboratedLangs = await u.collaboratedLangs({}, false)
  console.log(ownedLangs)
  if (!(ownedLangs instanceof Error)) {
    set(ownedLangsPaginator, ownedLangs)
    ownedLangsList.value.push(...ownedLangs.data)
  }

  if (!(collaboratedLangs instanceof Error)) {
    set(collaboratedLangsPaginator, collaboratedLangs)
    collaboratedLangsList.value.push(...collaboratedLangs.data)
  }
  set(loading, false)
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
  if (get(hadError)) {
    return `${get(errorStatus)} | Hanas`
  }
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

let activeTab = 0

const onTabChanged = (i: number) => {
  activeTab = i
}

const loadingMoreOwned = ref(false)
const loadingMoreCollaborated = ref(false)
const loadingMoreLiked = ref(false)

useInfiniteScroll(
  ref(document),
  async () => {
    console.log('loading more...')
    if (activeTab > 1) return undefined
    const paginator = [ownedLangsPaginator, collaboratedLangsPaginator][
      activeTab
    ]
    const list = [ownedLangsList, collaboratedLangsList][activeTab]
    const loading = [
      loadingMoreOwned,
      loadingMoreCollaborated,
      loadingMoreLiked,
    ][activeTab]

    const p = get(paginator)

    if (p?.next) {
      set(loading, true)
      const newPaginator = await p.next()
      console.log(newPaginator)
      if (!(newPaginator instanceof Error)) {
        list.value.push(...newPaginator.data)
        set(paginator, newPaginator)
        console.log('loaded more')
      }
      set(loading, false)
    }
  },
  { distance: 10 }
)

onMounted(loadUser)
watch(() => route.path, loadUser)
</script>

<template>
  <main
    class="mr-0 px-0 h-card vcard"
    :class="{
      'ml-0': isSmall || hadError,
      'mt-0 !max-w-screen': hadError,
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
          <div class="flex flex-row pt-4 gap-2">
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
            <IconButton
              label="invite"
              v-if="loggedInUser && !viewingOwnProfile"
            >
              <mdi-account-plus-outline />
            </IconButton>
            <UserActionsMenu :user="user" v-if="!viewingOwnProfile" />
          </div>

          <UserDetails :user="user" />
        </div>

        <!-- langs -->
        <div
          ref="s"
          class="flex flex-1 flex-col lang-detail-container"
          :class="{ 'max-w-2/3': isLarge }"
        >
          <HTabbed
            v-if="!loading"
            :compress="compressSelector"
            @changedTab="onTabChanged"
          >
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
              <span
                class="no-languages"
                v-if="!ownedLangsList.length && viewingOwnProfile"
              >
                {{ t('no_owned_languages.own_profile.text') }}
                <router-link class="link" to="/new-language">
                  {{ t('no_owned_languages.own_profile.link') }}
                </router-link>
              </span>
              <span class="no-languages" v-else-if="!ownedLangsList.length">
                {{ t('no_owned_languages.other_profile') }}
              </span>
              <LangDetails
                v-else
                v-for="lang of ownedLangsList"
                :key="lang.code"
                :lang="lang"
              />
              <div class="flex flex-row justify-center items-center py-2">
                <Spinner v-if="loadingMoreOwned" />
              </div>
            </template>

            <template #tab-content-2>
              <h3 class="compressed-title" v-if="compressSelector">
                {{ t('collaborated_languages.title') }}
              </h3>
              <div
                class="no-languages"
                v-if="!collaboratedLangsList.length && viewingOwnProfile"
              >
                {{ t('no_collaborated_languages.own_profile') }}
              </div>
              <div
                class="no-languages"
                v-else-if="!collaboratedLangsList.length"
              >
                {{ t('no_collaborated_languages.other_profile') }}
              </div>
              <LangDetails
                v-else
                v-for="lang of collaboratedLangsList"
                :key="lang.code"
                :lang="lang"
              />
              <div class="flex flex-row justify-center items-center py-2">
                <Spinner v-if="loadingMoreCollaborated" />
              </div>
            </template>

            <template #tab-content-3>
              <h3 class="compressed-title" v-if="compressSelector">
                {{ t('liked_languages.title') }}
              </h3>
              <!--
              <span
                class="no-languages"
                v-if="!ownedLangsList.length && viewingOwnProfile"
              >
                {{ t('no_liked_languages.own_profile.text') }}
                <router-link class="link" to="/new-language">
                  {{ t('no_liked_languages.own_profile.link') }}
                </router-link>
              </span>
              <span
                class="no-languages"
                v-else-if="!ownedLangsList.length"
              >
                {{ t('no_liked_languages.other_profile') }}
              </span>-->
              <div class="no-languages">{{ t('coming_soon') }}</div>
              <div class="flex flex-row justify-center items-center py-2">
                <Spinner v-if="loadingMoreLiked" />
              </div>
            </template>
          </HTabbed>
          <div v-else class="flex flex-row justify-center items-center h-full">
            <Spinner />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="hadError"
      class="flex flex-col flex-1 justify-center items-center"
    >
      <h1 class="text-3xl pb-4">{{ errorStatus }}</h1>
      <p v-if="errorStatus === 404">{{ t('error.user_not_found.text') }}</p>
      <p v-else>{{ t('error.server_error.text') }}</p>
      <router-link v-if="errorStatus === 404" class="link" to="/users">
        {{ t('error.user_not_found.link') }}
      </router-link>
      <router-link v-else class="link" to="/report_bug">
        {{ t('error.server_error.link') }}
      </router-link>
    </div>
    <div v-else class="flex flex-col flex-1 justify-center items-center">
      <Spinner />
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
    "liked_languages.title": "Liked languages",

    "no_owned_languages.own_profile.text": "You haven't made any languages.",
    "no_owned_languages.own_profile.link": "Let's make one!",
    "no_owned_languages.other_profile": "This user hasn't made any languages.",

    "no_collaborated_languages.own_profile": "You aren't collaborating on any languages.",
    "no_collaborated_languages.other_profile": "This user isn't collaborating on any languages.",

    "no_liked_languages.own_profile.text": "You haven't liked any languages.",
    "no_liked_languages.own_profile.link": "Why not check some out?",

    "no_liked_languages.other_profile": "This user hasn't liked any languages.",

    "error.user_not_found.text": "No user was found by that username.",
    "error.user_not_found.link": "Try searching for another user?",

    "error.server_error.text": "There was an internal server error.",
    "error.server_error.link": "Please report this!"
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

.no-languages {
  @apply flex flex-row gap-1 justify-center items-center flex-1;
}
</style>

<style>
.lang-detail-container > div:last-child {
  @apply h-full;
}
.lang-detail-container > div:last-child > .tab-panel {
  @apply h-full flex flex-col;
}
.pfp-container img {
  @apply h-full w-full;
}
</style>
