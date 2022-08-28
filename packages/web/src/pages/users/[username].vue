<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, Ref } from 'vue'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'
import {
  asyncComputed,
  get,
  set,
  useElementSize,
  useInfiniteScroll,
} from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { Lang, User } from '@hanas-app/api-helper'
import { useRoute } from 'vue-router'
import { size, isSmall, isLarge, isMedium } from '~/composables/device-size'

const { t } = useI18n()

const hadError = ref(false)

const user: Ref<User | null> = ref(null)

const route = useRoute()

const loading = ref(true)

const userStore = useUserStore()

const { user: loggedInUser } = storeToRefs(userStore)

const viewingOwnProfile = computed(
  () =>
    get(loggedInUser)?.username === get(user)?.username && get(user)?.username
)
const resolved = ref(false)

const ownedLangsList: Ref<Lang[]> = ref([])
const collaboratedLangsList: Ref<Lang[]> = ref([])

const langsContainer: Ref<HTMLDivElement | null> = ref(null)

useInfiniteScroll(langsContainer, () => {
  // load more langs
})

onMounted(async () => {
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
})

const banner: Ref<HTMLDivElement | null> = ref(null)

const { width: bannerWidth } = useElementSize(banner)

const bannerHeight = computed(() => get(bannerWidth) / 3.65)

const pfpContainer: Ref<HTMLDivElement | null> = ref(null)

const pfpSize = computed(() => get(bannerWidth) * (256 / 990))
</script>

<template>
  <main
    class="mr-0 px-0 h-card vcard"
    :class="{
      'ml-0': isSmall,
    }"
  >
    <div v-if="user">
      <div
        class="banner w-full"
        :style="{ height: bannerHeight + 'px' }"
        ref="banner"
      ></div>

      <div class="flex" :class="{ 'flex-row': isLarge, 'flex-col': !isLarge }">
        <div class="relative min-w-70 px-4 flex flex-col pb-4">
          <!-- pfp -->
          <div
            ref="pfpContainer"
            class="absolute -top-28 rounded-full bg-surface-light dark:bg-surface-dark flex justify-center items-center pfp-container"
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
                'text-on-surface-variant-light dark:text-on-surface-variant-dark font-light text-lg':
                  user.displayName,
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
            class="break-words"
            :class="{
              'text-on-surface-variant-light dark:text-on-surface-variant-dark italic':
                viewingOwnProfile && !user.description,
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
          <!-- edit profile button -->
          <span class="flex flex-row pt-4">
            <HButton
              kind="outline"
              v-if="viewingOwnProfile"
              :content="t('edit_profile')"
              as="router-link"
              href="/edit-profile"
            >
              <mdi-pencil></mdi-pencil>
            </HButton>
          </span>

          <dl
            class="pt-4 user-description text-on-surface-variant-light dark:text-on-surface-variant-dark flex"
            :class="{
              'flex-row gap-4': size === 'medium',
              'flex-col': size !== 'medium',
            }"
          >
            <div v-if="user.pronouns">
              <dt>
                <mdi-tag-heart
                  aria-label="Pronouns"
                  title="Pronouns"
                ></mdi-tag-heart>
              </dt>
              <dd>
                {{ user.pronouns }}
              </dd>
            </div>

            <div v-if="user.gender">
              <dt>
                <icons8-gender
                  aria-label="Gender"
                  title="Gender"
                ></icons8-gender>
              </dt>
              <dd class="!inline-flex flex-row items-center">
                <span
                  class="border-current border rounded-full w-4 h-4 inline-block top-[2px] relative"
                  :style="{ 'background-color': `#${user.gender}` }"
                  >&nbsp;</span
                >
                <span class="ml-1">(#{{ user.gender }})</span>
              </dd>
            </div>

            <div>
              <dt>
                <mdi-calendar
                  aria-label="Account created"
                  title="Account created"
                ></mdi-calendar>
              </dt>
              <dd>Joined {{ user.created.toLocaleDateString() }}</dd>
            </div>
          </dl>
        </div>

        <!-- langs -->
        <div class="flex flex-1 flex-col">
          <TabGroup>
            <TabList class="flex flex-row gap-2 text-lg w-full">
              <Tab v-slot="{ selected }" as="template">
                <button
                  class="flex-1 flex flex-row justify-center gap-2 items-center border-b-2 border-transparent px-5 py-3 interactable-bg-surface-light dark:interactable-bg-surface-dark"
                  :class="{
                    'border-primary-light dark:border-primary-dark': selected,
                  }"
                >
                  <mdi-account-star
                    class="relative top-[1px] min-w-5 min-h-5"
                  />
                  <span class="inline align-bottom">Owned languages</span>
                </button>
              </Tab>
              <Tab v-slot="{ selected }" as="template">
                <button
                  class="flex-1 flex flex-row justify-center gap-2 items-center border-b-2 border-transparent px-5 py-3 interactable-bg-surface-light dark:interactable-bg-surface-dark"
                  :class="{
                    'border-primary-light dark:border-primary-dark': selected,
                  }"
                >
                  <mdi-account-group
                    class="relative top-[1px] min-w-5 min-h-5"
                  />
                  <span class="inline align-bottom"
                    >Collaborated languages</span
                  >
                </button>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel> hi {{ size }} </TabPanel>
              <TabPanel> hey </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "missing_description": "This user likes having an air of mystery about themselves.",
    "missing_description_on_own_profile": "You haven't set a description. Edit your profile to tell the world about yourself!",
    "edit_profile": "Edit profile"
  }
}
</i18n>

<style>
.banner {
  background-color: #3b3f44;
  background-image: url('https://pbs.twimg.com/profile_banners/1274705620214710273/1592749498/1500x500');
  background-size: cover;
}
.pfp-container img {
  @apply h-full w-full;
}
.user-description > div {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.user-description dt {
  margin-right: 0.5rem;
  height: 1.2rem;
  width: 1.2rem;
}
.user-description dd {
  display: inline;
  vertical-align: middle;
}
</style>
