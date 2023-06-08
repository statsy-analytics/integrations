import { VueStatsy } from '@statsy/vue'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(VueStatsy, {
  siteId: 'clid7v2pm000eqt0gkpu9lcyt',
  eventMiddleware: (event) => {
    console.log({ event })
    return event
  }
})

app.mount('#app')
