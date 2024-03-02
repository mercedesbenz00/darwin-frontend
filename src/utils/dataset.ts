import { DatasetPayload, TeamPayload } from '@/store/types'

/**
 * Returns if the dataset is in the current team or not
 */
export const isDatasetInCurrentTeam = (
  dataset: DatasetPayload,
  currentTeam: TeamPayload | null
): boolean => {
  if (!currentTeam) { return false }
  return dataset.team_id === currentTeam.id
}
