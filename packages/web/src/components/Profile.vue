<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { client } from '~/hanas-api'
import { useUserStore } from '~/stores/user'

const props = defineProps<{
  username: string
}>()

const user = await client.users.get(props.username)

const { user: loggedInUser } = storeToRefs(useUserStore())

const editProfileDialogOpen = ref(false)
</script>

<template>
  <div class="banner w-full h-[200px]"></div>

  <div class="relative w-full px-4 flex flex-col gap-2">
    <div class="flex flex-row w-full">
      <div
        class="absolute h-30 w-30 -top-15 left-4 rounded-full bg-surface-light dark:bg-surface-dark flex justify-center items-center pfp-container"
      >
        <ProfilePicture
          :username="user.username"
          class="u-photo h-9/10 w-9/10"
        />
      </div>
      <div class="flex flex-column items-center gap-1 pt-20">
        <span class="font-bold text-lg p-name fn" v-if="user.displayName">{{
          user.displayName
        }}</span>
        <h1
          :class="{
            'font-bold text-lg': !user.displayName,
            'text-on-surface-variant-light dark:text-on-surface-variant-dark':
              user.displayName,
          }"
        >
          @<span
            class="p-nickname nickname"
            :class="{ 'p-name fn': !user.displayName }"
          >
            {{ user.username }}
          </span>
        </h1>
      </div>

      <span class="flex-1 flex flex-row justify-end pt-4">
        <HButton
          kind="outline"
          v-if="loggedInUser!.username === user.username"
          content="Edit profile"
          as="router-link"
          href="/edit-profile"
        >
          <mdi-pencil></mdi-pencil>
        </HButton>
      </span>
    </div>
    <p class="max-w-[60ch]">
      this is an example description Et facilis recusandae aut officiis.
      Occaecati mollitia impedit ut doloribus. Quia non repellat ratione
      ratione. Dolorem aliquam dolores voluptatum ut tempora magni veritatis.
      Consequuntur perferendis quasi commodi assumenda. Commodi officiis
      voluptas nemo officiis dolorem molestiae. Suscipit et aliquam dolorem sed.
      Maiores numquam fuga est sapiente et sit voluptate molestiae. this is an
      example description Et facilis recusandae aut officiis. Occaecati mollitia
      impedit ut doloribus. Quia non repellat ratione ratione. Dolorem aliquam
      dolores voluptatum ut tempora magni veritatis. Consequuntur perferendis
      quasi commodi assumenda. Commodi officiis voluptas nemo officiis dolorem
      molestiae. Suscipit et aliquam dolorem sed. Maiores numquam fuga est
      sapiente et sit voluptate molestiae.
    </p>
  </div>
</template>

<style>
.banner {
  background-color: #3b3f44;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1c1e' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.pfp-container img {
  @apply h-full w-full;
}
</style>
