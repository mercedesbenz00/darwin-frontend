import { AClassMutation } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'

export const UPDATE_ANNOTATION_ATTRIBUTE: AClassMutation<AttributePayload> = (state, attribute) => {
  const idx = state.attributes.findIndex(elem => elem.id === attribute.id)
  if (idx < 0) {
    state.attributes.push(attribute)
  } else {
    state.attributes.splice(idx, 1, attribute)
  }
}
