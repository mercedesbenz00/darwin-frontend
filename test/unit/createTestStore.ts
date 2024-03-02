import { Store } from 'vuex'

import v2Workflow, { getInitialState as V2WorkflowState } from '@/store/modules/V2Workflow'
import aclass, { getInitialState as aclassState } from '@/store/modules/aclass'
import admin, { getInitialState as adminState } from '@/store/modules/admin'
import annotator, { getInitialState as annotatorState } from '@/store/modules/annotator'
import annotators, { getInitialState as annotatorsState } from '@/store/modules/annotators'
import apiKey, { getInitialState as apiKeyState } from '@/store/modules/apiKey'
import auth, { getInitialState as authState } from '@/store/modules/auth'
import billing, { getInitialState as billingState } from '@/store/modules/billing'
import comment, { getInitialState as commentState } from '@/store/modules/comment'
import dataset, { getInitialState as datasetState } from '@/store/modules/dataset'
import datasetItemReports, { getInitialState as datasetItemReportsState } from '@/store/modules/datasetItemReports'
import datasetUpload, { getInitialState as datasetUploadState } from '@/store/modules/datasetUpload'
import features, { getInitialState as featureState } from '@/store/modules/features'
import feedback, { getInitialState as feedbackState } from '@/store/modules/feedback'
import loading, { getInitialState as loadingState } from '@/store/modules/loading'
import neuralModel, { getInitialState as neuralModelState } from '@/store/modules/neuralModel'
import notification, { getInitialState as notificationState } from '@/store/modules/notification'
import sso, { getInitialState as ssoState } from '@/store/modules/sso'
import storage, { getInitialState as storageState } from '@/store/modules/storage'
import team, { getInitialState as teamState } from '@/store/modules/team'
import toast, { getInitialState as toastState } from '@/store/modules/toast'
import ui, { getInitialState as uiState } from '@/store/modules/ui'
import user, { getInitialState as userState } from '@/store/modules/user'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import workviewTracker, { getInitialState as workviewTrackerState } from '@/store/modules/workviewTracker'
import { RootState, Ability } from '@/store/types'

import { buildAnnotationTypePayload } from './factories'

export const initializeStore = (): Store<RootState> => new Store<RootState>({
  modules: {
    aclass: { ...aclass, state: aclassState() },
    admin: { ...admin, state: adminState() },
    annotator: { ...annotator, state: annotatorState() },
    annotators: { ...annotators, state: annotatorsState() },
    apiKey: { ...apiKey, state: apiKeyState() },
    auth: { ...auth, state: authState() },
    billing: { ...billing, state: billingState() },
    comment: { ...comment, state: commentState() },
    dataset: { ...dataset, state: datasetState() },
    datasetUpload: { ...datasetUpload, state: datasetUploadState() },
    features: { ...features, state: featureState() },
    feedback: { ...feedback, state: feedbackState() },
    loading: { ...loading, state: loadingState() },
    neuralModel: { ...neuralModel, state: neuralModelState() },
    notification: { ...notification, state: notificationState() },
    team: { ...team, state: teamState() },
    toast: { ...toast, state: toastState() },
    ui: { ...ui, state: uiState() },
    user: { ...user, state: userState() },
    v2Workflow: { ...v2Workflow, state: V2WorkflowState() },
    workview: { ...workview, state: workviewState() },
    workviewTracker: { ...workviewTracker, state: workviewTrackerState() },
    storage: { ...storage, state: storageState() },
    sso: { ...sso, state: ssoState() },
    datasetItemReports: { ...datasetItemReports, state: datasetItemReportsState() }
  }
})

/**
 * Creates a test store which is supposed to be identical to the app store.
 *
 * Can be called in `beforeEach` to give each test a fresh store instance
 *
 * Eventually, all tests which need a store should use this factory
 *
 * This function stubs out dispatch calls to the store, so they always succeed,
 * but never return any data.
 */

export const createTestStore = () => {
  const store = initializeStore()

  jest.spyOn(store, 'dispatch').mockResolvedValue({ data: {} })

  return store
}

/**
 * Same as createTestStore, except it doesn't stub out dispatch calls,
 * making it suitable for store action tests.
 *
 * The one exception is the toast store, which is still stubbed out.
 */
export const createUnstubbedTestStore = () => {
  const store = initializeStore()
  const { dispatch } = store
  // It seems like jest.mockImplementation only recognizes the last declaration
  // of store.dispatch type definition.
  // We use the first type definition and it seems like this can be resolved
  // after `vuex` and `ts-jest` use the same typescript versions
  jest.spyOn(store, 'dispatch').mockImplementation((type, payload) => {
    const actualType: string = type as unknown as string
    const actualPayload = payload as unknown as object

    if (actualType.startsWith('toast')) {
      return Promise.resolve({})
    } else {
      return dispatch(actualType, actualPayload)
    }
  })

  return store
}

export default createTestStore

/**
 * Push a set of abilities into the store which matches those of a full team member
 *
 * This is a WIP function which should be expanded as we discover which abilities are necessary
 */
export const giveFullMemberAbility = (store: Store<RootState>) => {
  const abilities: Ability[] = [{ subject: 'all', actions: ['view_full_datasets'] }]
  store.commit('auth/SET_ABILITIES', abilities)
}

/**
 * Push a set of abilities into the store which matches those of an annotator
 *
 * This is a WIP function which should be expanded as we discover which abilities are necessary
 */
export const giveAnnotatorAbiliy = (store: Store<RootState>) => {
  const abilities: Ability[] = []
  store.commit('auth/SET_ABILITIES', abilities)
}

const boundingBox = buildAnnotationTypePayload({ id: 1, name: 'bounding_box', granularity: 'main' })
const cuboid = buildAnnotationTypePayload({ id: 2, name: 'cuboid', granularity: 'main' })
const ellipse = buildAnnotationTypePayload({ id: 3, name: 'ellipse', granularity: 'main' })
const keypoint = buildAnnotationTypePayload({ id: 4, name: 'keypoint', granularity: 'main' })
const link = buildAnnotationTypePayload({ id: 5, name: 'link', granularity: 'main' })
const line = buildAnnotationTypePayload({ id: 6, name: 'line', granularity: 'main' })
const polygon = buildAnnotationTypePayload({ id: 7, name: 'polygon', granularity: 'main' })
const skeleton = buildAnnotationTypePayload({ id: 8, name: 'skeleton', granularity: 'main' })
const tag = buildAnnotationTypePayload({ id: 9, name: 'tag', granularity: 'main' })
const attributes = buildAnnotationTypePayload({ id: 10, name: 'attributes', granularity: 'sub' })
const autoAnnotate = buildAnnotationTypePayload({ id: 11, name: 'auto_annotate', granularity: 'sub' })
const directionalVector = buildAnnotationTypePayload({ id: 12, name: 'directional_vector', granularity: 'sub' })
const instanceId = buildAnnotationTypePayload({ id: 13, name: 'instance_id', granularity: 'sub' })
const text = buildAnnotationTypePayload({ id: 14, name: 'text', granularity: 'sub' })
const measures = buildAnnotationTypePayload({ id: 15, name: 'measures', granularity: 'sub' })
const inference = buildAnnotationTypePayload({ id: 16, name: 'inference', granularity: 'sub' })

boundingBox.subs = [text, instanceId, attributes, measures, inference]
cuboid.subs = [attributes, text]
ellipse.subs = [instanceId, attributes, text, measures]
line.subs = [instanceId, attributes, text]
link.subs = [attributes]
polygon.subs = [
  directionalVector,
  attributes,
  text,
  autoAnnotate,
  instanceId,
  measures,
  inference
]
skeleton.subs = [instanceId, attributes, text]
tag.subs = [text, inference]

export const setDefaultAnnotationTypes = (store: Store<RootState>) => {
  store.commit('aclass/SET_TYPES', [
    boundingBox,
    cuboid,
    ellipse,
    keypoint,
    link,
    line,
    polygon,
    skeleton,
    tag,
    attributes,
    autoAnnotate,
    directionalVector,
    instanceId,
    text,
    measures,
    inference
  ])
}
