import { RouteConfig } from 'vue-router'

export const workflowsRoute: RouteConfig = {
  path: '/workflows',
  name: 'Workflows',
  component: () => import(
    /* webpackChunkName "darwin" */
    '@/views/workflows/IndexView.vue'
  ),
  meta: {
    requiresAuth: true,
    requiresFeature: 'DARWIN_V2_ENABLED'
  }
}

export const workflowRoute: RouteConfig = {
  path: '/workflows/:workflowId',
  name: 'WorkflowCreation',
  component: () => import(
    /* webpackChunkName: "darwin" */ 
    '@/views/workflows/ShowView.vue'
  ),
  meta: {
    requiresAuth: true,
    requiresFeature: 'DARWIN_V2_ENABLED'
  }
}
