export type FeatureFlags = {
  LAYER_V2?: boolean
  RASTERS?: boolean
  COMMENTS_V2?: boolean
}

/**
 * Manages to on/off editor's available feature flags
 * Provides getters for each feature flag
 */
export class FeatureFlagsManager {
  static featureFlags: FeatureFlags = {
    LAYER_V2: false,
    RASTERS: false,
    COMMENTS_V2: false
  }

  static setFlags (flags: FeatureFlags): void {
    FeatureFlagsManager.featureFlags.LAYER_V2 = !!flags.LAYER_V2
    FeatureFlagsManager.featureFlags.RASTERS = !!flags.RASTERS
    FeatureFlagsManager.featureFlags.COMMENTS_V2 = !!flags.COMMENTS_V2
  }

  // OptimisedLayer usage for annotations render
  static get isOnLayerV2 (): boolean {
    return !!this.featureFlags.LAYER_V2
  }

  // Regular Layer usage for annotations render
  static get isOffLayerV2 (): boolean {
    return !this.isOnLayerV2
  }

  static get isOnRasters (): boolean {
    return !!this.featureFlags.RASTERS
  }

  static get isOffRasters (): boolean {
    return !this.isOnRasters
  }

  static get isOnCommentsV2 (): boolean {
    return !!this.featureFlags.COMMENTS_V2
  }

  static get isOffCommentsV2 (): boolean {
    return !this.isOnCommentsV2
  }
}
