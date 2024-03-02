/**
 * This is a wrapper around a temporary helper for useRouter.
 * Once we upgrade to the next version of vue-router, it can be removed.
 */
import { getCurrentInstance, onBeforeMount, reactive } from 'vue'
import VueRouter, { Route } from 'vue-router'

export const useRouter = (): VueRouter => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }
  return vm.proxy.$router
}
// Hotfix for route before migration to vue-router@4
export const useRoute = (): Route => {
  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error(
      'getCurrentInstance() returned null. Method must be called at the top of a setup function'
    )
  }

  const router = vm.proxy.$router

  const currentRoute: Route = reactive({
    fullPath: router.currentRoute.fullPath,
    query: router.currentRoute.query,
    path: router.currentRoute.path,
    name: router.currentRoute.name,
    hash: router.currentRoute.hash,
    meta: router.currentRoute.meta,
    params: router.currentRoute.params,
    redirectedFrom: router.currentRoute.redirectedFrom
  }) as Route

  const updateCurrentRoute = (route: Route): void => {
    currentRoute.fullPath = route.fullPath
    currentRoute.query = route.query
    currentRoute.path = route.path
    currentRoute.name = route.name
    currentRoute.hash = route.hash
    currentRoute.meta = route.meta
    currentRoute.params = route.params
    currentRoute.redirectedFrom = route.redirectedFrom
  }

  router.beforeEach((to, from, next) => {
    updateCurrentRoute(to)
    next()
  })

  onBeforeMount(() => {
    updateCurrentRoute(vm.proxy.$route)
  })

  return currentRoute
}
