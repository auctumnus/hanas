<script setup lang="ts">
import { HButton } from 'halcyon-vue'
import TextFieldGroup, { TextFieldGroupOptions } from '../TextFieldGroup.vue'

const emit = defineEmits(['done'])

const inputs = new TextFieldGroupOptions([
    {
        kind: 'filled',
        name: 'display-name',
        label: 'Display name',
        maxLength: 30,
        validate() {
            if(this.model.value.length < 2) {
                this.setError('Must be at least 2 characters long.')
                return false
            }
            return this.model.value.length <= 30
        }
    },
    {
        kind: 'filled',
        name: 'pronouns',
        label: 'Pronouns',
        maxLength: 15,
        validate() { return true }
    },
    {
        kind: 'filled',
        name: 'gender',
        label: 'Gender',
        maxLength: 6,
        defaultHelperText: 'Input a hex color.',
        validate() {
            return /^([a-fA-F0-9]{3}){1,2}$/.test(this.model.value)
        }
    },
    {
        kind: 'filled',
        name: 'description',
        label: 'Description',
        maxLength: 1000,
        multiline: true,
        rows: 10,
        validate() { return true }
    }
])

const onSubmit = async () => {
    const [valid, values] = inputs.validate()

    if(!valid) { return }
    const { 'display-name': displayName, gender, description } = values

    emit('done')
}
</script>

<template>
    <div class="container">
        <h1 class="title-large">Complete your profile</h1>
        <form @submit.prevent="onSubmit">
            <text-field-group :options="inputs" />
            <h-button content="Save" kind="filled" />
        </form>
    </div>
</template>

<style scoped lang="scss">
h1 {
    margin-top: 30px;
}

.row {
    display: flex;
    flex-direction: row;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

form {
    margin: 16px 0;
    
    &:deep(.text-field) {
        width: max(30vw, 280px);
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
</style>