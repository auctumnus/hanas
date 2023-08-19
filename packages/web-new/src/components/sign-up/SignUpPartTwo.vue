<script setup lang="ts">
import { HTextField, HButton } from 'halcyon-vue'
import { ref } from 'vue';
import AppearTransition from '../AppearTransition.vue';

const description = ref('')

const inputs = {
    'display-name': {
        name: 'display-name',
        label: 'Display name',
        maxLength: 30,
        model: ref(''),
        hasError: ref(false),
        validate() {
            return this.model.value.length > 2
        },
        
    },
    pronouns: {
        name: 'pronouns',
        label: 'Pronouns',
        maxLength: 15,
        model: ref('')
    },
    gender: {
        name: 'gender',
        label: 'Gender',
        model: ref('')
    }
}

</script>

<template>
    <appear-transition>
        <h1 class="title-large">Complete your profile</h1>
    </appear-transition>
    <form>
        <h-text-field
            v-for="[name, input] in Object.entries(inputs)"
            :key="name"
            :name="name"
            :label="input.label"
            kind="filled"
            v-model="input.model"
            :max-length="input.maxLength || undefined"
        >
        </h-text-field>
        <h-text-field
            name="description"
            label="Description"
            kind="filled"
            multiline
            return-raw
            :rows="8"
            v-model="description"
            :max-length="1000"
        />
    </form>
</template>

<style scoped lang="scss">
h1 {
    margin-top: 30px;
}

.row {
    display: flex;
    flex-direction: row;
}
form {
    margin: 16px 0;
    
    &:deep(.text-field) {
        width: max(30vw, 280px);
    }
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>