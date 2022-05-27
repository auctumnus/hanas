/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly HANAS_URL: string
  readonly KRATOS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
