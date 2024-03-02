import { computed, reactive } from 'vue'

import { FeatureName } from '@/store/types'

import { useStore } from './useStore'

type UseFeatureFlags = {
  /**
   * Holds a list of features enabled on the current team.
   * This affects availability of some plugins which are behind a feature flag.
   */
  enabledFeatures: FeatureName[],
  /**
   * Returns boolean indicating if a feature flag is enabled on the current team
   */
  featureEnabled: (feature: FeatureName) => boolean
}

/**
 * Composable hook used for dealing with feature flags.
 *
 * Ideally, eventually replaces the feature flags vue2 plugin,
 * as well as the features store.
 */
export const useFeatureFlags = (): UseFeatureFlags => {
  const { state } = useStore()

  const enabledFeatures = computed(
    () => (state.features.list || []).filter(f => f.enabled).map(f => f.name)
  )

  const featureEnabled = (feature: FeatureName): boolean => enabledFeatures.value.includes(feature)

  return reactive({
    enabledFeatures,
    featureEnabled
  })
}
