<template>
  <footer class="w-screen h-10 flex p-2 items-center flex-row justify-between">
    <div class="flex flex-row">
      <DarkLightSwitch />
      <a href="https://github.com/auctumnus/hanas-frontend" class="icon-btn">
        <i-carbon-logo-github />
      </a>
    </div>
    <div>
      <span>
        Hanas {{ v }}, made with
        <span class="text-accent-light dark:text-accent">❤</span>
        by
        <a
          href="https://github.com/auctumnus/hanas-frontend/graphs/contributors"
        >
          the Hanas contributors
        </a>
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { version } from '../../package.json'
const v = `v${version}`
</script>

<style scoped>
footer {
  box-shadow: 0 -3px 5px rgba(0, 0, 0, 0.1);
}
</style>
