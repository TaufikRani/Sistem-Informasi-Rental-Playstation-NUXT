// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  icon: {
    clientBundle: {
      scan: true,
      collections: ['lucide'],
    },
  },
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'rental-ps-session-secret-change-me-2026',
    },
    databaseUrl: process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps',
  },
})
