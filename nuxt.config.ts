import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt'],
  components: [
    {
      path: '~/components/admin',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    yookassaShopId: process.env.YOOKASSA_SHOP_ID,
    yookassaSecretKey: process.env.YOOKASSA_SECRET_KEY,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    publicAssets: [
      {
        baseURL: '/uploads',
        dir: 'uploads',
        maxAge: 60 * 60 * 24 * 7,
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
})
