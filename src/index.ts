import '@/assets/main.css'
import { createApp } from 'vue'
import App from '@/App.vue'
import { createVocEditRouter } from '@/router'

export const createVocEdit = (element: string | Element, base: string) => {
  const app = createApp(App)
  const router = createVocEditRouter(base)
  app.use(router)
  app.mount(element)
  return app
}
