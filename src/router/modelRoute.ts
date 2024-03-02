import { RouteConfig } from 'vue-router'

import store from '@/store'

const MainView = () => import(
  /* webpackChunkName: 'darwin' */
  '@/views/models/MainView.vue'
)

const IndexView = () => import(
  /* webpackChunkName: 'darwin' */
  '@/views/models/IndexView.vue'
)

const NewModelView = () => import(
  /* webpackChunkName: 'darwin' */
  '@/views/models/NewModelView.vue'
)

const ShowView = () => import(
  /* webpackChunkName: 'darwin' */
  '@/views/models/ShowView.vue'
)

const modelRoute: RouteConfig = {
  path: '/models',
  name: 'Models',
  meta: { requiresAuth: true },
  component: MainView,
  beforeEnter: (_to, _from, next) => {
    const { team } = store.state

    if (!(team.currentTeam && team.currentTeam.neural_models_enabled)) {
      return next('/')
    }

    return next()
  },
  children: [
    {
      path: '',
      name: 'ModelsIndex',
      component: IndexView,
      meta: { requiresAuth: true }
    },
    {
      path: 'new',
      name: 'ModelsCreate',
      component: NewModelView,
      meta: { requiresAuth: true }
    },
    {
      path: ':modelId',
      name: 'ModelsShow',
      component: ShowView,
      meta: { requiresAuth: true }
    }
  ]
}

export default modelRoute
