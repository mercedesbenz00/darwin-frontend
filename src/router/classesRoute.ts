import { RouteConfig } from 'vue-router'

const TeamClassesView = () => import(
  '@/views/classes/TeamClasses.vue'
  /* webpackChunkName: "darwin" */
)

const classesRoute: RouteConfig = {
  path: '/classes',
  name: 'Classes',
  component: TeamClassesView,
  meta: { requiresAuth: true, forbidsRoles: ['annotator'] }
}

export default classesRoute
