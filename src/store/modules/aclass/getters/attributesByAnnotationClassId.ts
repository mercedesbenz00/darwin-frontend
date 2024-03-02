import { Getter } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { RootState, AttributePayload } from '@/store/types'

export const attributesByAnnotationClassId: Getter<AClassState, RootState> =
  (state): { [key: string]: AttributePayload[] } =>
    state.attributes.reduce(
      (
        acc,
        entry: AttributePayload
      ) => {
        if (!entry.class_id) { return acc }
        if (!acc[entry.class_id]) {
          acc[entry.class_id] = []
        }
        acc[entry.class_id].push(entry)
        return acc
      },
      {} as { [key: string]: AttributePayload[] }
    )
