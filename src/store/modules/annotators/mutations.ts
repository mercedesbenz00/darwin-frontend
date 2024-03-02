import { MutationTree } from 'vuex'

import { AnnotatorsState, AnnotationReport } from './types'

const PUSH_ANNOTATION_REPORT = (state: AnnotatorsState, { params, data }: AnnotationReport) => {
  const index = state.annotationReports.findIndex(r =>
    r.params.datasetId === params.datasetId &&
      r.params.granularity === params.granularity &&
        r.params.from === params.from &&
        r.params.groupBy === params.groupBy
  )

  if (index === -1) {
    state.annotationReports.push({ params, data })
  } else {
    state.annotationReports.splice(index, 1, { params, data })
  }
}

export const mutations: MutationTree<AnnotatorsState> = {
  PUSH_ANNOTATION_REPORT
}
