// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 3 as unknown as 4 | 5 },
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'rental-ps-session-secret-change-me-2026',
    },
    databaseUrl: process.env.DATABASE_URL || 'mysql://root:rootpassword@127.0.0.1:3306/rental_ps',
  },
})
