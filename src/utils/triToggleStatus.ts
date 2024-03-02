export type TriToggleStatus = 'positive' | 'negative' | 'none'

export enum TriToggleStatusV2 {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NONE = 'none'
}

/**
 * Resolves next tri-toggle status
 * * First status: none
 * * Next status: positive
 * * Next status: negative
 */
export const resolveNextTriToggleStatus = (status: TriToggleStatus): TriToggleStatus => {
  if (status === 'positive') { return 'negative' }
  if (status === 'negative') { return 'none' }
  return 'positive'
}
