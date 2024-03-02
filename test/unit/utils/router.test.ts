import VueRouter, { Route } from 'vue-router'

import { buildRoute } from 'test/unit/factories'

import { resolveLocationFromRoute, resolveSettingsRoutePath } from '@/utils/router'

describe('resolveLocationFromRoute', () => {
  let route: Route

  it('should return RawLocation from Route', () => {
    route = buildRoute({ name: 'Datasets' })
    expect(resolveLocationFromRoute(route)).toEqual({
      ...route,
      name: 'Datasets'
    })
  })

  it('should return RawLocation from Route', () => {
    route = buildRoute({ name: null })
    expect(resolveLocationFromRoute(route)).toEqual({
      ...route,
      name: undefined
    })
  })
})

describe('resolveSettingsRoutePath', () => {
  let router: VueRouter
  let route: Route

  beforeEach(() => {
    router = new VueRouter()
    route = buildRoute({
      name: 'Datasets',
      path: '/datasets',
      fullPath: '/datasets'
    })
  })

  it('should return resolved settings route path', () => {
    expect(resolveSettingsRoutePath(router, route, 'profile')).toEqual('/datasets?settings=profile')
  })
})
