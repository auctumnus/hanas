import './style.css'
import 'reset.css'
import 'virtual:windi.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import routes from 'virtual:generated-pages'
import App from './App.vue'
import { key, store } from './store'

const history = createWebHistory()

const router = createRouter({ routes, history })

const app = createApp(App)

app.use(store, key)
app.use(router)
