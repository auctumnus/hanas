<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { useSlots } from 'vue'

const n = Object.keys(useSlots())
  .map((s) => s.slice(-1))
  .map((s) => Number(s))
  .filter((n) => !Number.isNaN(n))
  .reduce((acc, val) => (val > acc ? val : acc))
</script>

<template>
  <TabGroup>
    <TabList class="tab-list">
      <Tab v-slot="{ selected }" as="template" v-for="i in n">
        <button
          class="tab-button"
          :class="[selected ? 'tab-button-selected' : 'tab-button-unselected']"
        >
          <mdi-check v-if="selected && $slots['tab-button-icon-' + i]" />
          <slot v-else="!selected" :name="'tab-button-icon-' + i"></slot>
          <slot :name="'tab-button-text-' + i"></slot>
        </button>
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel v-for="j in n"
        ><slot :name="'tab-content-' + j"></slot
      ></TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<style>
.tab-list {
  @apply flex flex-row w-full justify-center py-4;
}
.tab-button {
  @apply flex flex-row justify-center gap-2 items-center h-10 px-4 border-outline border-y;
}
.tab-button-unselected {
  @apply interactable-bg-surface text-on-surface;
}
.tab-button-selected {
  @apply interactable-bg-secondary-container text-on-secondary-container;
}
.tab-button:first-child {
  @apply border rounded-l-full;
}
.tab-button:last-child {
  @apply border rounded-r-full;
}
.tab-button > .icon {
  @apply relative top-[1px] min-w-5 min-h-5;
}
.tab-button > span {
  @apply inline align-bottom;
}
</style>
