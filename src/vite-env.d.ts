/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SETTINGS_PASSWORD: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
