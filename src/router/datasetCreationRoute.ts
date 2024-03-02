import { RouteConfig } from 'vue-router'

const datasetCreationRoute: RouteConfig = {
  path: '/datasets/create',
  meta: { requiresAuth: true, requiresAbility: 'create_dataset' },
  component: () => import(
    /* webpackChunkName: "darwin" */
    '@/views/datasets/create/DatasetCreationView.vue'
  ),
  children: [
    {
      path: '',
      name: 'DatasetCreationCreateStep',
      component: () => import(
        /* webpackChunkName: "darwin" */
        '@/views/datasets/create/steps/Create.vue'
      ),
      meta: { requiresAuth: true, requiresAbility: 'create_dataset' }

    },
    {
      path: ':datasetId/data',
      name: 'DatasetCreationDataStep',
      component: () => import(
        /* webpackChunkName: "darwin" */
        '@/views/datasets/create/steps/Data.vue'
      ),
      meta: { requiresAuth: true, requiresAbility: 'create_dataset' }

    },
    {
      path: ':datasetId/instructions',
      name: 'DatasetCreationInstructionsStep',
      component: () => import(
        /* webpackChunkName: "darwin" */
        '@/views/datasets/create/steps/Instructions.vue'
      ),
      meta: { requiresAuth: true, requiresAbility: 'create_dataset' }

    },
    {
      path: ':datasetId/annotators',
      name: 'DatasetCreationAnnotatorsStep',
      component: () => import(
        /* webpackChunkName: "darwin" */
        '@/views/datasets/create/steps/Annotators.vue'
      ),
      meta: { requiresAuth: true, requiresAbility: 'create_dataset' }

    },
    {
      path: ':datasetId/workflow',
      name: 'DatasetCreationWorkflowStep',
      component: () => import(
        /* webpackChunkName: "darwin" */
        '@/views/datasets/create/steps/Workflow.vue'
      ),
      meta: { requiresAuth: true, requiresAbility: 'create_dataset' }
    }
  ]
}

export default datasetCreationRoute
