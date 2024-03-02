import { RouteConfig } from 'vue-router'

const AnnotatorsIndexView = () => import(
  '@/views/annotators/IndexView.vue'
  /* webpackChunkName: "darwin" */
)

const annotatorsRoute: RouteConfig = {
  path: '/annotators',
  name: 'Annotators',
  component: AnnotatorsIndexView,
  meta: { requiresAuth: true }
}

export default annotatorsRoute
