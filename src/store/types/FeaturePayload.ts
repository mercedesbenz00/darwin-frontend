export type FeatureName =
  'BLIND_STAGE' |
  'CODE_STAGE' |
  'CONSENSUS_STAGE_V2' |
  'DARWIN_V1_DISABLED' |
  'DARWIN_V2_ENABLED' |
  'DATA_IN_WORKFLOW_V2' |
  'LINK_TOOL' |
  'MODEL_STAGE' |
  'MODEL_TOOL' |
  'TEST_FEATURE_2' |
  'TEST_FEATURE' |
  'TICKER_BILLING' |
  'TICKER_UI' |
  'WEBHOOK_STAGE_V2' |
  'VIDEO_STREAM' |
  'COMMENTS_V2'

export type FeaturePayload = {
  enabled: boolean
  // removing feature from here will reveal its usage across the codebase
  // TEST_FEATURE and TEST_FEATURE_2 exist purely for test support
  name: FeatureName
}
