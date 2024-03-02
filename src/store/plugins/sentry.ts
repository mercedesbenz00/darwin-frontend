import * as Sentry from '@sentry/browser'
import { Store } from 'vuex'

import { RootState, UserPayload } from '@/store/types'
import { anonymize } from '@/utils'

export const anonymizeUser = (user: UserPayload) => {
  const [address, domain] = user.email.split('@')
  const email = `${anonymize(address, 1)}@${domain}`
  const username = `${user.first_name} ${anonymize(user.last_name, 1)}`

  return {
    id: user.id.toString(),
    email,
    username
  }
}

export const sentryPlugin = (store: Store<RootState>) => {
  return store.subscribe((mutation) => {
    const { type, payload } = mutation
    if (type === 'user/SET_PROFILE') {
      Sentry.configureScope((scope) => {
        scope.setUser(anonymizeUser(payload as UserPayload))
      })
    }
  })
}
