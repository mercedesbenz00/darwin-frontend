import { UserPayload } from '@/store/types/UserPayload'

export type UserState = {
  profile: null | UserPayload
}

// initial state
export const getInitialState = (): UserState => ({ profile: null })

export const state: UserState = getInitialState()
