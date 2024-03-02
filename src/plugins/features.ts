import _Vue, { PluginObject } from 'vue'
import { Store } from 'vuex'

import { FeaturePayload, RootState } from '@/store/types'

const isFeatureEnabled = (store: Store<RootState>, feature: FeaturePayload['name']): boolean => {
  const isFeatureEnabled =
    store.getters['features/isFeatureEnabled'] as (feature: string) => boolean
  return isFeatureEnabled(feature)
}

const FeaturePlugin: PluginObject<Store<RootState>> = {
  install: (Vue: typeof _Vue, store?: Store<RootState>) => {
    if (!store) { return }

    /**
     * Returns true if a feature flag is currently enabled
     *
     * @param {string} feature The name of the feature to check
     */
    Vue.prototype.$featureEnabled = function (feature: FeaturePayload['name']): boolean {
      return isFeatureEnabled(store, feature)
    }
  }
}

export default FeaturePlugin

declare module 'vue/types/vue' {
  interface Vue {
    $featureEnabled: (feature: FeaturePayload['name']) => boolean;
  }
}
