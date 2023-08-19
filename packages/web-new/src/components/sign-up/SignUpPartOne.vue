<script setup lang="ts">
import { HTextField, HButton } from 'halcyon-vue'
import { ref } from 'vue'
import { client } from '@/api'

const USERNAME_REGEX = /^([a-z0-9](-|_)?)+[a-z0-9]$/

const emit = defineEmits(['done'])

const email = ref('')
const username = ref('')
const password = ref('')

const usernameHasError = ref(false)
const emailHasError = ref(false)
const passwordHasError = ref(false)

const usernameError = ref('')

const onSubmit = async () => {
    if(username.value.length < 2) {
        usernameHasError.value = true
        usernameError.value = 'Must be at least 2 characters long.'
        return
    }

    if(username.value.length > 30) {
        usernameHasError.value = true
        usernameError.value = 'Must be at most 30 characters long.'
        return
    }

    if(!USERNAME_REGEX.test(username.value)) {
        usernameHasError.value = true
        usernameError.value = 'Must only have alphanumerics, _ and -.'
        return
    }

    try {
        //const user = await client.register(email.value, username.value, password.value)
        console.log(user)
    } catch(e) {
        console.error(e)
    }

    emit('done')
}
</script>

<template>
    <h1 class="title-large">Let's get you started</h1>
    <form @submit.prevent="onSubmit">
        <h-text-field
            kind="filled"
            v-model="username"
            name="username"
            label="Username"
            :max-length="30"
            :min-length="-1"
            :has-error="usernameHasError"
            required
        >
            <template #helper v-if="usernameHasError">
                <span>{{ usernameError }}</span>
            </template>
        </h-text-field>
        <h-text-field
            name="email"
            label="Email address"
            v-model="email"
            type="email"
            kind="filled"
            required
        >
        </h-text-field>
        <h-text-field
            name="password"
            label="Password"
            v-model="password"
            type="password"
            kind="filled"
            required
        >
            <template #helper>
                <a href="https://support.google.com/accounts/answer/32040">
                    Tips for making a good password
                </a>
            </template>
        </h-text-field>
        <h-button class="submit" kind="filled" content="Sign up" />
    </form>
    <hr />
    <p>
        <span>Already have an account?</span> <router-link to="sign-in">Sign in</router-link>
    </p>
</template>

<style scoped lang="scss">
form {
    margin: 16px 0;
    
    &:deep(.text-field) {
        width: max(30vw, 280px);
    }
    display: flex;
    flex-direction: column;
    align-items: center;
}
.submit {
    margin-top: 16px;
}
hr {
    width: max(30vw, 280px);
    margin: 16px 0;
    border: 1px solid var(--halcyon-outline-variant);
}
h1 {
    margin-top: 30px;
}
</style>