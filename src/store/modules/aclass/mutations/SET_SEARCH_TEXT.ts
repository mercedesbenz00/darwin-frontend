import { AClassMutation } from '@/store/modules/aclass/types'

export const SET_SEARCH_TEXT: AClassMutation<string> = (state, text) => {
  state.search = text
}
