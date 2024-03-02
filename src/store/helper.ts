import store from '@/store'

export const isFeatureEnabled = (key: string): boolean => {
  const isFeatureEnabled = store.
    getters['features/isFeatureEnabled'] as (feature: string) => boolean

  return isFeatureEnabled(key)
}

export const isLayerV2FeatureEnabled = (): boolean => {
  return isFeatureEnabled('LAYER_V2')
}

export const isLayerV2FeatureDisabled = (): boolean => {
  return !isFeatureEnabled('LAYER_V2')
}
