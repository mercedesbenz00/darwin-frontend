import { ClassMapping, WorkflowMutation } from '@/store/modules/workview/types'

type Payload = { runningSessionId: string, classMapping: ClassMapping }

export const SET_AUTO_ANNOTATE_CLASS_MAPPING: WorkflowMutation<Payload> =
  (state, instance) => {
    const { classMapping, runningSessionId } = instance
    state.classMapping[runningSessionId] = classMapping
    localStorage.setItem('class-mapping', JSON.stringify(state.classMapping))
  }
