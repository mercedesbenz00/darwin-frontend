import { ActionTree } from 'vuex'

import { SSOState } from '@/store/modules/sso/state'
import { RootState } from '@/store/types'

import { loadConfig } from './loadConfig'
import { saveConfig } from './saveConfig'

export const actions: ActionTree<SSOState, RootState> = {
  saveConfig,
  loadConfig
}
