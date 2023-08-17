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

import App from './App.vue'
import { createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
