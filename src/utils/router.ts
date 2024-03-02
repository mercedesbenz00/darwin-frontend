import VueRouter, { RawLocation, Route } from 'vue-router'

export const resolveSettingsRoutePath = (router: VueRouter, route: Route, tab: string): string => {
  return router.resolve({
    name: route.name || undefined,
    path: route.path,
    hash: route.hash,
    params: route.params,
    query: {
      ...route.query,
      settings: tab
    }
  }).route.fullPath
}

/**
 * Get RawLocation object from Router object
 */
export const resolveLocationFromRoute = (route: Route): RawLocation => {
  const { name, ...others } = route
  return {
    name: name || undefined,
    ...others
  }
}
