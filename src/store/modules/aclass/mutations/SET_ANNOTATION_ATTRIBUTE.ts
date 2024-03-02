import { AClassMutation } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'

export const SET_ANNOTATION_ATTRIBUTE: AClassMutation<{
  classId: number, attributes: AttributePayload[]
}> = (state, data) => {
  const { classId, attributes } = data

  if (classId) {
    // only replace entries for the provided class id
    state.attributes = state.attributes.filter(entry => entry.class_id !== classId)
    state.attributes.push(...attributes)
  } else {
    // if no classId is set replace all attributes
    state.attributes = attributes
  }
}
