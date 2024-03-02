import { RouteConfig } from 'vue-router'

const Workview = () => import(
  '@/views/workview/WorkflowView.vue'
  /* webpackChunkName: "darwin" */
  /* webpackPrefetch: true */
)

const WorkflowTutorialRoute: RouteConfig = {
  meta: { requiresAuth: true, layout: 'empty' },
  name: 'TutorialWorkflow',
  path: '/tutorial'
}

const WorkflowRoute: RouteConfig = {
  meta: { requiresAuth: true, layout: 'empty' },
  name: 'Workflow',
  path: '/workview'
}

const WorkviewRoute: RouteConfig = {
  children: [
    WorkflowRoute,
    WorkflowTutorialRoute
  ],
  component: Workview,
  meta: { layout: 'empty' },
  path: ''
}

export default WorkviewRoute
