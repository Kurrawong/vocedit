import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export const vocEditRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/resource',
    name: 'resource',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/ResourceView.vue'),
  },
]

export const createVocEditRouter = (base: string) => {
  return createRouter({
    history: createWebHistory(base),
    routes: vocEditRoutes,
  })
}
