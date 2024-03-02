import { AClassAction } from '@/store/modules/aclass/types'

type SetClassSelections = AClassAction<{
  selections: { id: number; selected: boolean }[]
}>

/**
 * Select Annotation Class
 * @param selections Array of class selection info
 */
export const setClassSelections: SetClassSelections = ({ commit }, params) => {
  commit('SET_CLASS_SELECTIONS', params.selections)
}
