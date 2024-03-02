import { RouteConfig } from 'vue-router'

import store from '@/store'

const MainView = () => import(
  '@/views/admin/MainView.vue'
  /* webpackChunkName: 'admin' */
)

const TeamsMainView = () => import(
  '@/views/admin/teams/MainView.vue'
  /* webpackChunkName: "admin" */
)

const TeamsIndexView = () => import(
  '@/views/admin/teams/IndexView.vue'
  /* webpackChunkName: "admin" */
)

const TeamsShowView = () => import(
  '@/views/admin/teams/ShowView.vue'
  /* webpackChunkName: "admin" */
)

const TeamOwnerInvitationsIndexView = () => import(
  '@/views/admin/invitations/IndexView.vue'
  /* webpackChunkName: "admin" */
)

const meta = { requiresAuth: true, layout: 'empty' }

const teamsRoute: RouteConfig = {
  path: 'teams',
  component: TeamsMainView,
  children: [
    { path: '', name: 'TeamsIndex', component: TeamsIndexView, meta },
    { path: ':teamId', name: 'TeamsShow', component: TeamsShowView, meta }
  ],
  meta
}

const teamOwnerInvitationsRoute: RouteConfig = {
  path: 'invitations',
  name: 'Team Owner Invitations',
  component: TeamOwnerInvitationsIndexView,
  meta
}

const adminRoute: RouteConfig = {
  path: '/admin',
  name: 'Admin',
  meta,
  component: MainView,
  beforeEnter: (_to, _from, next) => {
    // check if superuser, otherwise redirect back to root
    const { user } = store.state
    if (!(user.profile && user.profile.superuser)) { return next('/') }

    return next()
  },
  children: [
    teamsRoute,
    teamOwnerInvitationsRoute
  ]
}

export default adminRoute
