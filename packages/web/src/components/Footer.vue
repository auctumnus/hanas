<template>
  <footer
    class="
      bg-light1
      dark:bg-dark1
      w-screen
      h-10
      py-2
      px-4
      flex flex-row
      items-center
      justify-between
    "
  >
    <div class="flex flex-row">
      <DarkLightSwitch />
      <a
        href="https://github.com/auctumnus/hanas-frontend"
        class="icon-btn"
        aria-label="Github repository"
      >
        <i-carbon-logo-github />
      </a>
    </div>
    <div>
      <span>
        Hanas {{ v }}, made with
        <span class="text-accent-light dark:text-accent" aria-label="love">
          ❤
        </span>
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
  box-shadow: 0 -3px 5px var(--shadow);
}
</style>
