import 'halcyon:reset.css'
import 'halcyon:theme.css'
import 'halcyon:base.css'
import 'halcyon-vue/style'

import './main.scss'
import './typography.scss'

import { createRouter } from 'vue-router'
import routes from '~pages'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue'

import App from './App.vue'
import { createWebHistory } from 'vue-router'
import { client } from './api'
import { user } from './user'

import { installI18n } from './i18n'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

const head = createHead()
app.use(head)

installI18n(app)
app.use(createPinia())
app.use(router)

app.mount('#app')

;(async () => {
  user.value = await client.currentUser()
})()
