export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true
  },
  runtimeConfig: {
    yookassaShopId: process.env.YOOKASSA_SHOP_ID,
    yookassaSecretKey: process.env.YOOKASSA_SECRET_KEY,

    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
});
