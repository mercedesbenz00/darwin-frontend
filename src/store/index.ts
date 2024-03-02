import Vue from 'vue'
import Vuex, { Module, Store } from 'vuex'

import { analyticsMiddleware } from 'vue-analytics'

import v2Workflow, { getInitialState as getV2WorkflowInitialState } from './modules/V2Workflow'
import aclass, { getInitialState as getAclassInitialState } from './modules/aclass'
import admin, { getInitialState as getAdminInitialState } from './modules/admin'
import annotator, { getInitialState as getAnnotatorInitialState } from './modules/annotator'
import annotators, { getInitialState as getAnnotatorsInitialState } from './modules/annotators'
import apiKey, { getInitialState as getApiKeyInitialState } from './modules/apiKey'
import auth, { getInitialState as getAuthInitialState } from './modules/auth'
import billing, { getInitialState as getBillingInitialState } from './modules/billing'
import comment, { getInitialState as getCommentInitialState } from './modules/comment'
import dataset, { getInitialState as getDatasetInitialState } from './modules/dataset'
import datasetItemReports, { getInitialState as getDatasetItemReportsState } from './modules/datasetItemReports'
import datasetUpload, { getInitialState as getDatasetUploadInitialState } from './modules/datasetUpload'
import features, { getInitialState as getFeaturesInitialState } from './modules/features'
import feedback, { getInitialState as getFeedbackInitialState } from './modules/feedback'
import loading, { getInitialState as getLoadingInitialState } from './modules/loading'
import neuralModel, { getInitialState as getNeuralModelInitialState } from './modules/neuralModel'
import notification, { getInitialState as getNotificationInitialState } from './modules/notification'
import sso, { getInitialState as getSSOInitialState } from './modules/sso'
import storage, { getInitialState as getStorageInitialState } from './modules/storage'
import team, { getInitialState as getTeamInitialState } from './modules/team'
import toast, { getInitialState as getToastInitialState } from './modules/toast'
import ui, { getInitialState as getUIInitialState } from './modules/ui'
import user, { getInitialState as getUserInitialState } from './modules/user'
import workview, { getInitialState as getWorkviewInitialState } from './modules/workview'
import workviewTracker, { getInitialState as getWorkviewTrackerInitialState } from './modules/workviewTracker'
import { sentryPlugin } from './plugins/sentry'
import { RootState } from './types'

Vue.use<RootState>(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const plugins = [
  sentryPlugin
]

if (window.location.host === 'app.darwin.com' || window.location.host === 'staging.darwin.com') {
  plugins.push(analyticsMiddleware)
}

export const createStore = (): Store<RootState> => new Store<RootState>({
  modules: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aclass: aclass as unknown as Module<any, RootState>,
    admin,
    annotator,
    annotators,
    apiKey,
    auth,
    billing,
    comment,
    dataset,
    datasetUpload,
    features,
    feedback,
    loading,
    neuralModel,
    notification,
    team,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toast: toast as unknown as Module<any, RootState>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ui: ui as unknown as Module<any, RootState>,
    user,
    v2Workflow,
    workview,
    workviewTracker,
    storage,
    sso,
    datasetItemReports
  },
  strict: debug,
  plugins
})

const store = createStore()

export const resetStore = (): void => store.replaceState({
  aclass: getAclassInitialState(),
  admin: getAdminInitialState(),
  annotator: getAnnotatorInitialState(),
  annotators: getAnnotatorsInitialState(),
  apiKey: getApiKeyInitialState(),
  auth: getAuthInitialState(),
  billing: getBillingInitialState(),
  comment: getCommentInitialState(),
  dataset: getDatasetInitialState(),
  datasetUpload: getDatasetUploadInitialState(),
  features: getFeaturesInitialState(),
  feedback: getFeedbackInitialState(),
  loading: getLoadingInitialState(),
  toast: getToastInitialState(),
  neuralModel: getNeuralModelInitialState(),
  notification: getNotificationInitialState(),
  team: getTeamInitialState(),
  ui: getUIInitialState(),
  user: getUserInitialState(),
  v2Workflow: getV2WorkflowInitialState(),
  workview: getWorkviewInitialState(),
  workviewTracker: getWorkviewTrackerInitialState(),
  storage: getStorageInitialState(),
  sso: getSSOInitialState(),
  datasetItemReports: getDatasetItemReportsState()
})

store.subscribeAction({
  after: (action) => {
    if (action.type === 'auth/logoutStore') {
      resetStore()
    }
  }
})

export default store
