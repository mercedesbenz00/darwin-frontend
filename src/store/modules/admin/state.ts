import { AnnotationCreditPayload } from '@/store/types/AnnotationCreditPayload'

import { TeamPayload, TeamOwnerInvitation } from './types'

export type AdminState = {
  annotationCredits: AnnotationCreditPayload[],
  teams: TeamPayload[],
  teamOwnerInvitations: TeamOwnerInvitation[]
}

export const getInitialState = (): AdminState => ({
  annotationCredits: [],
  teams: [],
  teamOwnerInvitations: []
})

// initial state
export const state: AdminState = getInitialState()
