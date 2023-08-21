<script setup lang="ts">
import { isCompact } from '@/size';
import SignUpPartOne from '@/components/sign-up/SignUpPartOne.vue'
import SignUpPartTwo from '@/components/sign-up/SignUpPartTwo.vue'
import { computed, ref } from 'vue';
import AppearTransition from '@/components/AppearTransition.vue'
import { HButton } from 'halcyon-vue';
import { useRouter } from 'vue-router';

const part = ref(1)

const router = useRouter()

const component = computed(() => {
    switch(part.value) {
        case 1: return SignUpPartOne
        case 2: return SignUpPartTwo
    }
    return SignUpPartOne
})

const onDone = () => {
  switch(part.value) {
    case 1: part.value = 2; break
    case 2: router.push('/'); break
  }
}
</script>

<template>
    <main>
        <appear-transition>
            <h1 class="display-small" v-if="!isCompact">Sign up</h1>
        </appear-transition>
        <!--<h-button content="one" @click="part = 1" kind="filled" />
        <h-button content="two" @click="part = 2" kind="filled" />-->

        <Transition name="fade" mode="out-in">
            <component :is="component" @done="onDone" key="part" />
        </Transition>
        
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