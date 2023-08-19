import type { User } from "@hanas-app/api-helper"
import { computed, ref } from "vue"

export const user = ref<User | null>(null)

export const isLoggedIn = computed(() => user.value !== null)