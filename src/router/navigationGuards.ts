import VueRouter, { Route, Location, NavigationGuard } from 'vue-router'
import { Store } from 'vuex'

import { MembershipRole, RootState } from '@/store/types'
import { session } from '@/utils'
import { getCookie } from '@/utils/cookies'

const role = (store: Store<RootState>): MembershipRole | null =>
  store.getters['user/roleInCurrentTeam'] as MembershipRole | null

type Next = (to?: Location) => void

/**
 * Wrapper around the NavigationGuard
 * It accepts router instance as the first parameter.
 * The remaining parameters are regular NavigationGuard parameters
 *
 * Only the main '/datasets' route requires this guard.
 *
 * Other routes inaccessbile by annotators will have a `requiresAbility` check,
 * which will redirect them to this route.
 */
export type GlobalBeforeGuard = (router: VueRouter, to: Route, from: Route, next: Next) => void

/** Checks if user is annotator and if so, redirects to special annotator overview route */
export const annotatorGuard: GlobalBeforeGuard = (router, to, from, next) =>
  role(router.app.$store) === 'annotator'
    ? next({ name: 'DatasetsAnnotatorOverview' })
    : next()

const getRefreshTokenFromCookie = (): string | undefined => {
  const refreshKeys = ['v7_sso_saml_sign_in_refresh_token', 'v7_sso_sign_in_refresh_token']
  const refreshToken = refreshKeys.map(key => getCookie(key)).find(value => !!value)
  return refreshToken
}

const getTokenFromCookie = (): string | undefined => {
  const tokenKeys = ['v7_sso_saml_sign_in_token', 'v7_sso_sign_in_token']
  const token = tokenKeys.map(key => getCookie(key)).find(value => !!value)
  return token
}

export const ssoExchangeGuard: NavigationGuard<Vue> = (to, from, next) => {
  const refreshToken = getRefreshTokenFromCookie()
  const token = getTokenFromCookie()

  if (!refreshToken || !token) {
    console.error('Cannot get token or refreshToken')
    next({ name: 'Login' })
    return
  }

  const parsedToken = window.atob(token.split('.')[1])

  let tokenExpiration
  if (parsedToken) {
    tokenExpiration = JSON.parse(parsedToken)?.exp?.toString()
  }

  if (!tokenExpiration) {
    console.error('Cannot get tokenExpiration')
    next({ name: 'Login' })
    return
  }

  session.authenticate({
    isPermanent: true,
    refreshToken,
    token,
    tokenExpiration
  })

  next({ name: 'DatasetsIndex' })
}
