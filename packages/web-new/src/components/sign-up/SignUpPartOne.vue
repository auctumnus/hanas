<script setup lang="ts">
import { HTextField, HButton, snackbar } from 'halcyon-vue'
import { ref } from 'vue'
import { client } from '@/api'
import { TextFieldGroupOptions } from '../TextFieldGroup.vue'
import { USERNAME_REGEX, EMAIL_REGEX } from '@/constants'

const emit = defineEmits(['done'])

const password = ref('')

const inputs = new TextFieldGroupOptions([
    {
        kind: 'filled',
        name: 'username',
        label: 'Username',
        maxLength: 30,
        validate() {
            if(this.model.value.length < 2) {
                this.setError('Must be at least 2 characters long.')
                return false
            }

            if(this.model.value.length > 30) {
                this.setError('Must be at most 30 characters long.')
                return false
            }

            if(!USERNAME_REGEX.test(this.model.value)) {
                this.setError('Must only have alphanumerics, _ and -.')
                return false
            }

            return true
        }
    },
    {
        kind: 'filled',
        name: 'email',
        label: 'Email address',
        maxLength: 100,
        type: 'email',
        validate() {
            if(!EMAIL_REGEX.test(this.model.value)) {
                this.setError('Must be a valid email address.')
                return false
            }

            return true
        }
    }
])

const onSubmit = async () => {
    const [valid, values] = inputs.validate()

    if(!valid) { return }
    const { email, username } = values

    try {
        //const user = await client.register(email, username, password.value)
        //console.log(user)
    } catch(e) {
        console.error(e)
    }

    snackbar.pushNotification({
        message: 'Account created! Please check your email.'
    })

    emit('done')
}

</script>

<template>
    <div class="container">
        <h1 class="title-large">Let's get you started</h1>
        <form @submit.prevent="onSubmit">
            <text-field-group :options="inputs" />
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
    </div>
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
    gap: 4px;
}
.container {
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