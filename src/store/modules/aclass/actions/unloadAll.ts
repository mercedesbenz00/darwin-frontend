import { AClassAction } from '@/store/modules/aclass/types'

type UnloadAll = AClassAction<{}>

export const unloadAll: UnloadAll = ({ commit }) => {
  commit('RESET_ALL')
}
