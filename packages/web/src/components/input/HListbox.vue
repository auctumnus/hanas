<script setup lang="ts">
import { isSmall } from '~/composables/device-size'
</script>

<template>
  <Listbox @update:model-value="setLocale">
    <div class="w-40">
      <ListboxButton class="font-normal w-full">
        {{ t(`locales.${locale}`) }} ({{ locale }})
        <mdi-chevron-down class="pt-1" aria-hidden="true" />
      </ListboxButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <ListboxOptions
          class="absolute mt-1 w-40 overflow-auto rounded-md shadow-md shadow-gray-400 dark:shadow-dark-900 list-none pl-0"
          :class="{
            'text-sm': isSmall,
          }"
        >
          <ListboxOption
            v-slot="{ active }"
            v-for="l of availableLocales"
            :value="(l as string)"
          >
            <div
              class="flex flex-row items-center interactable-bg-surface-light dark:interactable-bg-surface-dark px-3 py-2 h-12"
              :class="{
                'font-semibold': l === locale,
                '!bg-on-surface-light/12 !dark:bg-on-surface-dark/12': active,
              }"
            >
              {{ t(`locales.${l}`) }} ({{ l }})
            </div>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
