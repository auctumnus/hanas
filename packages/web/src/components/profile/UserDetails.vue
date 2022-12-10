<script setup lang="ts">
import { size } from '~/composables/device-size'
import { User } from '@hanas-app/api-helper'
import { useI18n } from 'petite-vue-i18n'

defineProps<{
  user: User
}>()

const { t } = useI18n()
</script>

<template>
  <dl
    class="pt-4 user-description text-on-surface-variant flex"
    :class="{
      'flex-row gap-4': size === 'medium',
      'flex-col': size !== 'medium',
    }"
  >
    <div v-if="user.pronouns">
      <dt>
        <mdi-tag-heart aria-label="Pronouns" title="Pronouns"></mdi-tag-heart>
      </dt>
      <dd>
        {{ user.pronouns }}
      </dd>
    </div>

    <div v-if="user.gender">
      <dt>
        <icons8-gender aria-label="Gender" title="Gender"></icons8-gender>
      </dt>
      <dd class="!inline-flex flex-row items-center">
        <span
          class="border-current border rounded-full w-4 h-4 inline-block mr-1"
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
      <dd>
        {{ t('join_date') }}
        {{ user.created.toLocaleDateString() }}
      </dd>
    </div>
  </dl>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

dt {
  margin-right: 0.5rem;
  height: 1.2rem;
  width: 1.2rem;
}

dd {
  display: inline;
  vertical-align: middle;
}
</style>

<i18n>
{
  "en": {
    "join_date": "Joined"
  }
}
</i18n>
