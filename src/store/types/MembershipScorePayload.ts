export type ScorePayload = {
  /* eslint-disable camelcase */
  score: number | null
  merged_instances: number
  rejected_instances: number
  /* eslint-enable camelcase */
}

export type MembershipScorePayload = {
  id: number
  dataset: ScorePayload
  team: ScorePayload
}
