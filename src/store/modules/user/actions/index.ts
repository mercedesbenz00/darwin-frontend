import { ActionTree } from 'vuex'

import { UserState } from '@/store/modules/user/state'
import { RootState } from '@/store/types'

import { confirmTutorial } from './confirmTutorial'
import { deleteProfile } from './deleteProfile'
import { loadProfile } from './loadProfile'
import { updateProfile } from './updateProfile'
import { uploadProfileAvatar } from './uploadProfileAvatar'

type Actions = ActionTree<UserState, RootState>

export const actions: Actions = {
  confirmTutorial,
  deleteProfile,
  loadProfile,
  updateProfile,
  uploadProfileAvatar
}
