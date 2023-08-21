<script setup lang="ts">
import TextField, { TextFieldOptions } from '@/components/TextField.vue';
import { EMAIL_REGEX } from '@/constants';
import { isCompact } from '@/size';
import { HTextField } from 'halcyon-vue';
import { ref } from 'vue';

const password = ref('')

const email = new TextFieldOptions({
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
    })

const onSubmit = async () => {
}
</script>

<template>
    <main>
        <appear-transition>
            <h1 class="display-small" v-if="!isCompact">Sign in</h1>
        </appear-transition>
        <form @submit.prevent="onSubmit">
            <text-field :options="email" />
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

            <h-button class="submit" kind="filled" content="Sign in" />
        </form>
        <hr />
        <p>
            <span>Don't have an account?</span> <router-link to="sign-up">Sign up</router-link>
        </p>
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
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

h1 {
  margin-top: 30px;
}

.submit {
    margin-top: 16px;
}
hr {
    width: max(30vw, 280px);
    margin: 16px 0;
    border: 1px solid var(--halcyon-outline-variant);
}
</style>