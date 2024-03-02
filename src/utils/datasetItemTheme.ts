import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { StageType } from '@/store/types/StageType'

export type ItemThemes = {
  [key in DatasetItemStatus | StageType]: ItemTheme
}

export type ItemTheme = {
  highlightColor: string
}

export const itemTheme: ItemThemes = {
  [DatasetItemStatus.archive]: {
    highlightColor: colors.colorStagesArchiveDefault
  },
  [DatasetItemStatus.annotate]: {
    highlightColor: colors.colorStagesAnnotateDefault
  },
  [DatasetItemStatus.complete]: {
    highlightColor: colors.colorStagesCompleteDefault
  },
  [DatasetItemStatus.error]: {
    highlightColor: colors.colorStatusNegative
  },
  [DatasetItemStatus.archived]: {
    highlightColor: colors.colorStatusNegative
  },
  [DatasetItemStatus.new]: {
    highlightColor: colors.colorSurfaceRaise
  },
  [DatasetItemStatus.processing]: {
    highlightColor: colors.colorSurfaceRaise
  },
  [DatasetItemStatus.review]: {
    highlightColor: colors.colorStagesReviewDefault
  },
  [DatasetItemStatus.uploading]: {
    highlightColor: colors.colorSurfaceRaise
  },
  [StageType.Annotate]: {
    highlightColor: colors.colorStagesAnnotateDefault
  },
  [StageType.Review]: {
    highlightColor: colors.colorStagesReviewDefault
  },
  [StageType.Complete]: {
    highlightColor: colors.colorStagesCompleteDefault
  },
  [StageType.ConsensusEntrypoint]: {
    highlightColor: colors.colorStagesConsensusDefault
  },
  [StageType.ConsensusTest]: {
    highlightColor: colors.colorTestOrange
  },
  [StageType.Discard]: {
    highlightColor: colors.colorStagesDiscardDefault
  },
  [StageType.Model]: {
    highlightColor: colors.colorStagesModelDefault
  },
  [StageType.Code]: {
    highlightColor: colors.colorStagesCodeDefault
  },
  [StageType.Test]: {
    highlightColor: colors.colorTestOrange
  },
  [StageType.Dataset]: {
    highlightColor: colors.colorStagesDatasetDefault
  },
  [StageType.Logic]: {
    highlightColor: colors.colorStagesLogicDefault
  },
  [StageType.Webhook]: {
    highlightColor: colors.colorStagesWebhookDefault
  }
}
