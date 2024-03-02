import { ActionContext, StoreOptions } from 'vuex'

import { V2Workflows } from '@/store/types/V2WorkflowPayload'
import { ParsedError } from '@/utils'

import { AClassState } from './modules/aclass/state'
import { AdminState } from './modules/admin/state'
import { AnnotatorState } from './modules/annotator'
import { AnnotatorsState } from './modules/annotators/types'
import { ApiKeyState } from './modules/apiKey/types'
import { AuthState } from './modules/auth/state'
import { BillingState } from './modules/billing/state'
import { CommentState } from './modules/comment/state'
import { DatasetState } from './modules/dataset/state'
import { DatasetItemReportsState } from './modules/datasetItemReports/state'
import { DatasetUploadState } from './modules/datasetUpload/state'
import { FeaturesState } from './modules/features'
import { FeedbackState } from './modules/feedback'
import { LoadingState } from './modules/loading'
import { NeuralModelState } from './modules/neuralModel/types'
import { NotificationState } from './modules/notification'
import { SSOState } from './modules/sso/state'
import { StorageState } from './modules/storage/state'
import { TeamState } from './modules/team/state'
import { ToastState } from './modules/toast'
import { UIState } from './modules/ui'
import { UserState } from './modules/user/state'
import { WorkviewState } from './modules/workview/state'
import { WorkviewTrackerState } from './modules/workviewTracker'

export type Ability = {
  /**
   * String defining the type of subject this ability applies to.
   *
   * Generally not evaluated during authorization and mainly serves as a debug
   * tool, except for one specific case.
   *
   * If `subject` is `all`, no further checks are made and the current user is
   * allowed to perform actions in this ability on any resource they want.
   */
  subject: string | Object

  /**
   * List of actions covered by this ability. The current resource can perform
   * all actions listed on
   *
   * - any resource, if `subject` is `all`
   * - any resource which satisfies given conditions, if they are given
   */
  actions: string[]

  /**
   * Optionally adds conditions which a resource must satisfy in order to
   * perform any of the listed actions.
   *
   * If a resource is a membership, which has the shape of
   *
   * ```
   * { id, user_id, team_id, role }
   * ```
   *
   * Then the condition could be something like
   *
   * ```
   * { role: 'annotator' }
   * ```
   *
   * That means the current user is authorized to perform actions listed in this
   * ability to members of role `annotator` and only those members.
   *
   * If a different shape of resource is given, or it has a different rule, the
   * current user is not allowed to perform any actions in this ability.
   *
   * The condition could also be an array, such as
   *
   * ```
   * { role: ['annotator', 'member'] }
   * ```
   *
   * In that case, the current user is authorized to perform actions listed in
   * this ability to members of roles either `annotator` or `member`.
   */
  conditions?: { [s: string]: number | string | boolean }
}

export type AbilityOptions = {
  subject: string | undefined
  resource: any | null
}

export enum LoadingStatus {
  Unloaded,
  Loading,
  Loaded
}

/**
 * Standardized return type for a store action.
 * Contains a data key action succeeded, error key if it failed.
 */
export type ActionResponse<T = any> =
  Promise<ApiResponse<T> | ParsedError | void> |
  ApiResponse<T> |
  ParsedError |
  void

/**
 * Standardized type definition for a store action
 */
export type TypedAction<S, R, P, T = any> =
  (this: StoreOptions<R>, injectee: ActionContext<S, R>, payload: P) => ActionResponse<T>

export type TypedMutation<S, P = any> = (state: S, payload: P) => void

export type StoreActionPayload<T extends TypedAction<any, any, any, any>> = Parameters<T>[1]

export type StoreActionResponse<Action extends TypedAction<any, any, any>> =
  Action extends TypedAction<any, any, any, infer Response>
    ? { data: Response } | ParsedError
    : never

export type StoreMutationPayload<T extends TypedMutation<any, any>> = Parameters<T>[1]

// TODO: as modules convert to .ts, we need to set correct type for each module
export interface RootState {
  version?: string
  aclass: AClassState
  admin: AdminState
  annotator: AnnotatorState
  annotators: AnnotatorsState,
  apiKey: ApiKeyState
  auth: AuthState
  billing: BillingState
  comment: CommentState
  dataset: DatasetState
  datasetUpload: DatasetUploadState
  features: FeaturesState
  feedback: FeedbackState
  loading: LoadingState
  neuralModel: NeuralModelState
  notification: NotificationState
  team: TeamState
  toast: ToastState
  ui: UIState
  user: UserState
  v2Workflow: V2Workflows
  workview: WorkviewState
  workviewTracker: WorkviewTrackerState
  storage: StorageState
  sso: SSOState
  datasetItemReports: DatasetItemReportsState
}

export type Store = StoreOptions<RootState>

export type ValidationErrors = { [s: string]: string | [string] | ValidationErrors }

// TODO: Remove it
export * from '@/engine/models'

export * from '@/store/types/AnnotationActorPayload'
export * from '@/store/types/AnnotationClassesDetailsPayload'
export * from '@/store/types/AnnotationClassPayload'
export * from '@/store/types/AnnotationCreditPayload'
export * from '@/store/types/AnnotationHotkeysPayload'
export * from '@/store/types/AnnotationMeasure'
export * from '@/store/types/AnnotationPayload'
export * from '@/store/types/AnnotationTypeName'
export * from '@/store/types/AnnotationTypePayload'
export * from '@/store/types/AttributePayload'
export * from '@/store/types/ClassUsagePayload'
export * from '@/store/types/ClientTeamInvitationPayload'
export * from '@/store/types/CommentPayload'
export * from '@/store/types/CommentThreadPayload'
export * from '@/store/types/CreditUsagePayload'
export * from '@/store/types/Dataset'
export * from '@/store/types/DatasetAnnotationReportPayload'
export * from '@/store/types/DatasetAnnotatorPayload'
export * from '@/store/types/DatasetDetailPayload'
export * from '@/store/types/DatasetExportPayload'
export * from '@/store/types/DatasetFolderPayload'
export * from '@/store/types/DatasetImagePayload'
export * from '@/store/types/DatasetItemCountsPayload'
export * from '@/store/types/DatasetItemFilenamePayload'
export * from '@/store/types/DatasetItemFilter'
export * from '@/store/types/DatasetItemPayload'
export * from '@/store/types/DatasetItemsLoadingState'
export * from '@/store/types/DatasetItemStatus'
export * from '@/store/types/DatasetItemTimeSummaryPayload'
export * from '@/store/types/DatasetItemType'
export * from '@/store/types/DatasetPayload'
export * from '@/store/types/DatasetReportPayload'
export * from '@/store/types/DatasetReportPayload'
export * from '@/store/types/DatasetUploadedItemPayload'
export * from '@/store/types/DatasetUploadedItemsPayload'
export * from '@/store/types/DatasetUploadItemPayload'
export * from '@/store/types/DatasetVideoPayload'
export * from '@/store/types/FeaturePayload'
export * from '@/store/types/ImagePayload'
export * from '@/store/types/InputTag'
export * from '@/store/types/InstanceCountReportPayload'
export * from '@/store/types/InvitationPayload'
export * from '@/store/types/Login2FAResponsePayload'
export * from '@/store/types/LoginResponsePayload'
export * from '@/store/types/LogoutResponsePayload'
export * from '@/store/types/MeasureRegionsPayload'
export * from '@/store/types/MeasureUnit'
export * from '@/store/types/MembershipPayload'
export * from '@/store/types/MembershipRole'
export * from '@/store/types/MembershipScore'
export * from '@/store/types/MembershipScorePayload'
export * from '@/store/types/NotificationMessagePayload'
export * from '@/store/types/NotificationPayload'
export * from '@/store/types/PaginationTypes'
export * from '@/store/types/PresetPayload'
export * from '@/store/types/ReviewStatus'
export * from '@/store/types/Setup2FAResponsePayload'
export * from '@/store/types/SkippedReason'
export * from '@/store/types/SkippedReason'
export * from '@/store/types/StageActionType'
export * from '@/store/types/StageAnnotationPayload'
export * from '@/store/types/StageState'
export * from '@/store/types/StageTimeState'
export * from '@/store/types/StageType'
export * from '@/store/types/StoragePayload'
export * from '@/store/types/StorageProvider'
export * from '@/store/types/TeamPayload'
export * from '@/store/types/TeamUploadInfoPayload'
export * from '@/store/types/UserPayload'
export * from '@/store/types/V2CommentPayload'
export * from '@/store/types/V2CommentThreadPayload'
export * from '@/store/types/V2DatasetFolderPayload'
export * from '@/store/types/V2DatasetItemFilter'
export * from '@/store/types/V2DatasetItemPayload'
export * from '@/store/types/V2DatasetItemTimeSummaryPayload'
export * from '@/store/types/V2DatasetItemSlot'
export * from '@/store/types/V2SlotSection'
export * from '@/store/types/V2InstanceStatus'
export * from '@/store/types/V2WorkflowEdgePayload'
export * from '@/store/types/V2WorkflowItemPayload'
export * from '@/store/types/V2WorkflowItemStatePayload'
export * from '@/store/types/V2WorkflowPayload'
export * from '@/store/types/V2WorkflowStageConfigPayload'
export * from '@/store/types/V2WorkflowStageInstancePayload'
export * from '@/store/types/V2WorkflowStagePayload'
export * from '@/store/types/ValidationError'
export * from '@/store/types/VideoFramePayload'
export * from '@/store/types/WorkflowActionPayload'
export * from '@/store/types/WorkflowActionType'
export * from '@/store/types/WorkflowPayload'
export * from '@/store/types/WorkflowStagePayload'
export * from '@/store/types/WorkflowStageTemplatePayload'
export * from '@/store/types/WorkflowTemplatePayload'
export * from '@/store/types/WorkforceManagerPayload'
export * from '@/utils/wind/types'

export { RESET_ZOOM_MODE } from '@/store/types/ResetZoomMode'

export type ApiResponse<T> = { data: T }
