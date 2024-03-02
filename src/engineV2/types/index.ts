import { ToolManager, ActionManager } from '@/engineV2/managers'
import { Annotation, AnnotationData } from '@/engineV2/models'
import { InterpolationAlgorithm } from '@/engineV2/utils/interpolate'

export * from './PluginContext'

export type VideoAnnotationDataPayload = {
  data: AnnotationData
  subs: Annotation[]
  keyframe: boolean
  subkeyframe: boolean
  interpolateAlgorithm: InterpolationAlgorithm
}

export type VideoSubAnnotationDataPayload = {
  subs: Annotation[]
  subkeyframe: boolean
}

export type ViewManagers = {
  toolManager: ToolManager
  actionManager: ActionManager
}
