import { AClassAction } from '@/store/modules/aclass/types'
import { AnnotationClassMetadata, AnnotationClassPayload } from '@/store/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import {
  createAnnotationClass as backendCreateAnnotationClass
} from '@/utils/backend'
import {
  createAnnotationClass as tutorialCreateAnnotationClass
} from '@/utils/tutorialBackend'

/* eslint-disable camelcase */
type Payload = {
  annotationTypeNames: AnnotationTypeName[]
  description: string | null
  images: AnnotationClassPayload['images']
  metadata: AnnotationClassMetadata,
  name: string
  datasets: AnnotationClassPayload['datasets']
}
/* eslint-enable camelcase */

type Action = AClassAction<Payload, AnnotationClassPayload>

/**
* Create a new Annotation Class for the current team
*/
export const createAnnotationClass: Action = async ({ commit, rootState, state }, payload) => {
  if (!rootState.team.currentTeam) {
    throw new Error('[aclass/createAnnotationClass] requires current team to be set')
  }

  const annotationTypeIds = state.types
    .filter(t => payload.annotationTypeNames.includes(t.name))
    .map(t => t.id)

  if (annotationTypeIds.length !== payload.annotationTypeNames.length) {
    throw new Error('[aclass/createAnnotationClass] Invalid type names specified')
  }

  const params: Parameters<typeof backendCreateAnnotationClass>[0] = {
    annotation_type_ids: annotationTypeIds,
    datasets: payload.datasets,
    description: payload.description,
    images: payload.images,
    metadata: payload.metadata,
    name: payload.name,
    team_slug: rootState.team.currentTeam.slug
  }

  const response = rootState.workview.tutorialMode
    ? tutorialCreateAnnotationClass(params)
    : await backendCreateAnnotationClass(params)

  if ('data' in response) {
    commit('PUSH_CLASS', response.data)
  }

  return response
}
