import '@/assets/main.css'

import { createApp } from 'vue'
import App from '@/App.vue'
import { createVocEditRouter } from '@/router'

const app = createApp(App)

const router = createVocEditRouter(import.meta.env.BASE_URL)
app.use(router)

app.mount('#app')
