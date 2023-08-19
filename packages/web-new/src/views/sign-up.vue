<script setup lang="ts">
import { isCompact } from '@/size';
import SignUpPartOne from '@/components/sign-up/SignUpPartOne.vue'
import { ref } from 'vue';
import AppearTransition from '@/components/AppearTransition.vue'
import { HButton } from 'halcyon-vue';

const part = ref(2)
</script>

<template>
    <main>
        <appear-transition>
            <h1 class="display-small" v-if="!isCompact">Sign up</h1>
        </appear-transition>
        <h-button content="one" @click="part = 1" kind="filled" />
        <h-button content="two" @click="part = 2" kind="filled" />

        <sign-up-part-one v-if="part === 1" @done="part = 2" />
        <sign-up-part-two v-if="part === 2" @done="$router.push('/')" />

        
    </main>
</template>

<route lang="yaml">
meta:
  title: Sign up
</route>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
}

h1 {
  margin-top: 30px;
}
</style>