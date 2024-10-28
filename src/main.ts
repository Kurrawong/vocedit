import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'

import 'shacl-ui/styles/style.css'
import { shuiPlugin } from 'shacl-ui'

const app = createApp(App)
app.use(PrimeVue)
app.use(ToastService)
app.use(shuiPlugin)

app.use(router)
app.mount('#app')
