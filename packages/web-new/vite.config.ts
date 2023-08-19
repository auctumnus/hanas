import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { Halcyon } from 'halcyon-vue/plugin'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import webfontDownload from 'vite-plugin-webfont-dl'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import theme from './theme.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Pages({
      dirs: 'src/views'
    }),
    Halcyon({ theme }),
    Icons({ compiler: 'vue3' }),
    webfontDownload(),
    Components({
      dts: true,
      resolvers: [
        IconsResolver({
          prefix: false,
          enabledCollections: ['mdi']
        })
      ]
    }),
    VueI18nPlugin({
      include: [fileURLToPath(new URL('./locales/**', import.meta.url))]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: true,
  },
})
