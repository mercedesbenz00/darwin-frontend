import qs from 'qs'
import Vue from 'vue'
import Component from 'vue-class-component'
import Router from 'vue-router'
import { Store } from 'vuex'

import { workflowRoute, workflowsRoute } from '@/router/workflowsRoute'
import { FeaturePayload, RootState } from '@/store/types'
import { getToken } from '@/utils'

import adminRoute from './adminRoute'
import annotatorsRoute from './annotatorsRoute'
import classesRoute from './classesRoute'
import datasetCreationRoute from './datasetCreationRoute'
import datasetRoute from './datasetRoute'
import modelRoute from './modelRoute'
import { ssoExchangeGuard } from './navigationGuards'
import openDatasetRoute from './openDatasetRoute'
import workviewRoute from './workviewRoute'

Vue.use(Router)

// Register the router hooks with their names
// required for typescript support
Component.registerHooks([
  'setup',
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
])

const DOCS_URL = 'https://v7labs.github.io/darwin-py/'

const router: Router = new Router({
  mode: 'history',
  parseQuery: (query: string) => {
    return qs.parse(query, { comma: true })
  },
  stringifyQuery: (query: Object): string => {
    const queryString = qs.stringify(query, { arrayFormat: 'comma' })
    return queryString ? (`?${queryString}`) : ''
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () =>
        import(/* webpackChunkName: "darwin" */ '@/views/AppLayout.vue'),
      children: [
        /*
          `/hack` allows vue router to navigate to a temporary page, this way beforeEach will be
          fired when navigating back to the same page as before. Normally $router.push(current_url)
          is a NOP.

          $router.push('/dataset')

          do something

          $router.push('/hack')
          $router.replace('/dataset')
          */
        { path: '/hack' },
        {
          path: '/',
          beforeEnter: (to, from, next): void => {
            if (router.app.$featureEnabled('DARWIN_V2_ENABLED')) {
              return next('/workflows')
            }

            return next('/datasets')
          }
        },
        {
          path: '/docs',
          name: 'Documentation',
          beforeEnter: (): void => { window.location.href = DOCS_URL }
        },
        classesRoute,
        annotatorsRoute,
        adminRoute,
        workviewRoute,
        {
          path: '/academy',
          name: 'Academy',
          beforeEnter: (): void => {
            window.location.href = 'https://www.v7labs.com/academy'
          }
        },
        modelRoute,

        {
          path: '/login',
          name: 'Login',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/Login.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/login-sso',
          name: 'LoginSSO',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/LoginSSO.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/sso/saml/exchange',
          name: 'SSOSamlExchange',
          beforeEnter: ssoExchangeGuard
        },
        { path: '/sso/exchange', name: 'SSOExchange', beforeEnter: ssoExchangeGuard },
        {
          path: '/login-2fa',
          name: 'LoginTfa',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/LoginTfa.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/setup-2fa',
          name: 'SetupTfa',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/SetupTfa.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/forgot-password',
          name: 'ForgotPassword',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/auth/ForgotPassword.vue'
          ),
          meta: { layout: 'empty' }
        },
        {
          path: '/password-reset',
          name: 'PasswordReset',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/auth/PasswordReset.vue'
          ),
          meta: { layout: 'empty' }
        },
        {
          path: '/register',
          name: 'Register',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/Register.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/register-team',
          name: 'RegisterTeam',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/teams/RegisterTeam.vue'
          ),
          meta: { requiresAuth: true, layout: 'empty' }
        },
        {
          path: '/register-members',
          name: 'RegisterMembers',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/teams/RegisterMembers.vue'
          ),
          meta: { requiresAuth: true, layout: 'empty' }
        },
        {
          path: '/select-team',
          name: 'SelectTeam',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/teams/TeamSelect.vue'
          ),
          meta: { requiresAuth: true, layout: 'empty' }
        },
        {
          path: '/join',
          name: 'Invitations',
          component: () => import(/* webpackChunkName: "darwin" */ '@/views/auth/Invitations.vue'),
          meta: { layout: 'empty' }
        },
        {
          path: '/account-deleted',
          name: 'AccountDeleted',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/auth/AccountDeleted.vue'
          ),
          meta: { layout: 'empty' }
        },
        {
          path: '/error',
          name: 'error',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/error/ErrorPage.vue'
          ),
          meta: { layout: 'empty' }
        },
        {
          path: '/datasets',
          name: 'DatasetsIndex',
          component: () => import(
            /* webpackChunkName: "darwin" */
            '@/views/datasets/IndexView.vue'
          ),
          meta: { requiresAuth: true }
        },
        datasetCreationRoute,
        {
          path: '/datasets/:datasetId',
          redirect: '/datasets/:datasetId/dataset-management',
          meta: {
            requiresAuth: true,
            requiresAbility: 'view_full_datasets'
          }
        },
        datasetRoute,
        workflowsRoute,
        workflowRoute,
        openDatasetRoute,
        { path: '*', redirect: '/error' }
      ]
    }
  ]
})

type Meta = {
  requiresAbility?: string
  requiresAuth?: boolean
  requiresFeature?: FeaturePayload['name']
}

const tfaRoutes = [
  '/login-2fa',
  '/setup-2fa'
]

/**
 * Global handler to fire before each route navigation
 *
 * It's important to follow the pattern of an early return on redirect.
 *
 * If we return with `next()` early, the remaining checks will never be performed.
 *
 * In any other case, callback should not return until the end.
 */
router.beforeEach(async (to, from, next) => {
  const store = router.app.$store as Store<RootState>
  const { auth, features, team } = store.state
  const meta = (to.meta as Meta)

  // check if authenticated, try to login with stored token if not
  if (!auth.authenticated && getToken()) {
    await store.dispatch('auth/loginWithToken')
  }

  // check if feature is not loaded yet
  if (!features.list) {
    await store.dispatch('features/getFeatures')
  }

  await store.dispatch('ui/loadWorkerMode')

  const isUnauthRoute = ['Login', 'ForgotPassword', 'PasswordReset'].some(r => r === to.name)
  if (meta.requiresAuth && !auth.authenticated && !isUnauthRoute) {
    // pass path and query as `prev` param to login route before redirecting
    // login route can then redirect back to attempted route
    const { path, query } = to
    const params: any = { prev: { path, query } }
    return next({ name: 'Login', params })
  }

  if (auth.authenticated) {
    // ensure user has a team
    if (!(team.currentTeam && team.currentTeam.id)) {
      if (tfaRoutes.includes(to.path) || to.path === '/register-team') { return next() }
      return next('/register-team')
    }
    // ensure the current team is not disabled
    if (
      team.currentTeam &&
      team.currentTeam.disabled &&
      to.path !== '/select-team' &&
      !to.path.startsWith('/admin')
    ) {
      return next('/select-team')
    }
  }

  // some routes require a special ability to access
  const { requiresAbility: ability } = meta
  if (ability && !router.app.$can(ability)) { return next('/') }

  const { requiresFeature: feature } = meta
  if (feature && !router.app.$featureEnabled(feature)) { return next('/') }

  return next()
})

export default router
