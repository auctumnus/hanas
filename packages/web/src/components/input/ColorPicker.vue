<script setup lang="ts">
import { get, onClickOutside } from '@vueuse/core'

import { set, useFocusWithin } from '@vueuse/core'
import { Ref, ref, watch } from 'vue'

const colorPickerPopup: Ref<HTMLInputElement | null> = ref(null)

const { focused } = useFocusWithin(colorPickerPopup)

const showColorPicker = ref(false)

const hex = ref('')

const hue = ref(0)

const onBlur = () => {
  // fun fact: for some unholy reason, it decides to focus the body for literally like,
  // a frame. i don't know why
  setTimeout(() => {
    if (!get(colorPickerPopup)?.contains(document.activeElement)) {
      set(showColorPicker, false)
    }
  }, 100)
}

watch(focused, () => {
  onBlur()
})

onClickOutside(colorPickerPopup, () => set(showColorPicker, false))
</script>

<template>
  <div
    ref="colorPickerPopup"
    class="w-40"
    @keydown.esc="showColorPicker = false"
  >
    <HInput
      type="filled"
      name="color"
      label="color"
      class="max-w-full"
      v-model="hex"
      @focus="showColorPicker = true"
      @blur="onBlur()"
    />
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-90 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-90 opacity-0 -translate-y-2"
    >
      <div
        v-if="showColorPicker"
        class="absolute bg-surface-light dark:bg-surface-dark w-52 h-52 rounded-md shadow-md shadow-gray-400 dark:shadow-dark-900 p-4 mt-1"
      >
        <div class="w-full">
          <div class="w-full h-full"></div>
        </div>
        <Slider v-model="hue"></Slider>
      </div>
    </transition>
  </div>
</template>
