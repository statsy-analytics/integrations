import { VueStatsy } from '@statsy/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueStatsy, {
    siteId: 'clid7v2pm000eqt0gkpu9lcyt',
    eventMiddleware: (event) => {
      console.log({ event })
      return event
    }
  })
})