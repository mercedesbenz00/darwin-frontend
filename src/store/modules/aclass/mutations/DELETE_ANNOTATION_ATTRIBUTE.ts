import { AClassMutation } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'

export const DELETE_ANNOTATION_ATTRIBUTE: AClassMutation<AttributePayload> = (state, data) => {
  const idx = state.attributes.findIndex(elem => elem.id === data.id)
  if (idx >= 0) {
    state.attributes.splice(idx, 1)
  }
}
