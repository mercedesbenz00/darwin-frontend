import Vue from 'vue'
import { MutationTree } from 'vuex'

import { UserPayload } from '@/store/types/UserPayload'

import { UserState } from './state'

export const mutations: MutationTree<UserState> = {
  SET_PROFILE (state, profile: UserPayload | null) {
    state.profile = profile
  },
  SET_PROFILE_AVATAR_URL (state, url: string) {
    if (!state.profile) { return }
    if (!state.profile.image) {
      Vue.set(state.profile, 'image', { url })
    } else {
      Vue.set(state.profile.image, 'url', url)
    }
  },
  SET_TUTORIAL_SEEN (state) {
    if (!state.profile) { return }
    state.profile.tutorial_seen = true
  }
}
