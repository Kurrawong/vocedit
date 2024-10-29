import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ResourceView from '@/views/ResourceView.vue'
import OpenedHomeView from '@/views/OpenedHomeView.vue'
import NewProjectView from '@/views/NewProjectView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/edit', component: OpenedHomeView },
  { path: '/edit/resource', component: ResourceView, name: 'resource' },
  { path: '/new-project', component: NewProjectView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
