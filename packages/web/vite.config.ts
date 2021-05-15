import { defineConfig } from "vite"
import Pages from "vite-plugin-pages"
import Vue from "@vitejs/plugin-vue"
import WindiCSS from "vite-plugin-windicss"
import Icons, { ViteIconsResolver } from 'vite-plugin-icons'
import Components from 'vite-plugin-components'
/* import Favicons from 'vite-plugin-favicon' */

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Pages(),
    WindiCSS(),
    Components({
      customComponentResolvers: ViteIconsResolver()
    }),
    Icons()
    /* Favicons({
      favicons: {
        appName: 'Hanas',
        appDescription: 'A conlanging tool and community'
      },
      logo: './src/assets/logo.svg'
    }) */
  ], 
})
