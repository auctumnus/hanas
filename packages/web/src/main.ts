// register vue composition api globally
import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
import { useUserStore } from './stores/user'
import { client } from './hanas-api'

// windicss layers
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
// your custom styles here
import './styles/main.css'
// windicss utilities should be the last style import
import 'virtual:windi-utilities.css'
// windicss devtools support (dev only)
import 'virtual:windi-devtools'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
// @ts-ignore
export const createApp = ViteSSG(App, { routes }, async (ctx) => {
  // install all modules under `modules/`
  Object.values(import.meta.globEager('./modules/*.ts')).map((i) =>
    i.install?.(ctx)
  )
  // try to log in the client
  const userStore = useUserStore()
  const user = await client.currentUser()
  if (user) {
    console.log('logged in!')
    userStore.replaceUser(user)
  } else {
    console.log('not logged in')
  }
})
