import './style.css'
import 'reset.css'
import 'virtual:windi.css'
import { ViteSSG } from "vite-ssg"
// @ts-ignore
import routes from "virtual:generated-pages"
import App from "./App.vue"
import {key, store} from './store'

export const createApp = ViteSSG(
  App, 
  { routes },
  ({app}) => {
    app.use(store, key)
  }
)

