import * as Sentry from '@sentry/browser'
import _Vue, { PluginObject } from 'vue'

const SentryPlugin: PluginObject<any> = {
  install: (Vue: typeof _Vue) => {
    Vue.prototype.$sentry = Sentry
  }
}

export default SentryPlugin

declare module 'vue/types/vue' {
  interface Vue {
    $sentry: typeof Sentry
  }
}
