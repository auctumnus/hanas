<template>
  <header
    class="
      h-14
      w-screen
      fixed
      top-0
      left-0
      bg-light1
      dark:bg-dark1
      flex flex-row
      items-center
      justify-between
      py-2
      px-4
    "
  >
    <Sidebar />
  </header>
</template>

<style scoped>
header {
  box-shadow: 0 3px 5px var(--shadow);
}
</style>
