import { Ability, InvitationPayload } from '@/store/types'

import { TfaCredentials } from './types'

export type AuthState = {
  abilities: Ability[]
  authenticated: boolean
  invitation: InvitationPayload | null
  tfaCredentials: TfaCredentials | null
}

// initial state
export const getInitialState = (): AuthState => ({
  abilities: [],
  authenticated: false, // Flag for Authenticated
  invitation: null,
  tfaCredentials: null
})

export const state: AuthState = getInitialState()
