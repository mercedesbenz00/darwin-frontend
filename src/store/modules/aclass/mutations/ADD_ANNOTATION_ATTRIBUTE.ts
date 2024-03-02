import { AClassMutation } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'

export const ADD_ANNOTATION_ATTRIBUTE: AClassMutation<AttributePayload> = (state, data) => {
  const idx = state.attributes.findIndex(elem => elem.id === data.id)
  if (idx < 0) {
    state.attributes.push(data)
  } else {
    state.attributes.splice(idx, 1, data)
  }
}
