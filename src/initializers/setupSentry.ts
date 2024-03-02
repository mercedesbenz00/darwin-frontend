import { init } from '@sentry/browser'
import { Vue as VueIntegration, CaptureConsole } from '@sentry/integrations'
import { VueConstructor } from 'vue'

import { resolveVariable } from '@/utils/config'

const resolveDsn = (): string | null =>
  resolveVariable(process.env.VUE_APP_SENTRY_DSN, '$SENTRY_DSN')

const resolveEnvironment = (): string | null =>
  resolveVariable(process.env.VUE_APP_ENVIRONMENT, '$ENVIRONMENT')

const resolveRelease = (): string | null =>
  resolveVariable(process.env.VUE_APP_BUILD, '$BUILD')

const createVueIntegration = (Vue: VueConstructor) => new VueIntegration({
  Vue,
  // sends all props for the component as part of the error report
  attachProps: true,
  // default is false and means Vue errors (prop errors, for example)
  // would no longer get logged to console
  logErrors: true
})

export const setupSentry = (Vue: VueConstructor) => {
  // dsn is required
  const dsn = resolveDsn()
  if (!dsn) { return }

  const vueIntegration = createVueIntegration(Vue)
  const consoleIntegration = new CaptureConsole({ levels: ['error'] })

  // production | staging | devbot
  const environment = resolveEnvironment()

  // SHA of the latest commit
  const release = resolveRelease()

  const params = {
    dsn,
    integrations: [vueIntegration, consoleIntegration],
    ...(environment && { environment }),
    ...(release && { release })
  }

  init(params)
}
