import { Route } from 'vue-router'

export const buildRoute = (params: Partial<Route>): Route => ({
  path: '/',
  hash: '',
  query: {},
  params: {},
  fullPath: '/',
  matched: [],
  ...params
})
