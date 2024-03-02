import { StageActionType, StageType } from '@/store/types'

const MAPPING: {
  [k in StageType]: Record<Exclude<StageType, StageType.Dataset>, StageActionType>
} = {
  [StageType.Archive]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Annotate]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Review]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Dataset]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Model]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Code]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Test]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Complete]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.MarkAsComplete,
    [StageType.Code]: StageActionType.MarkAsComplete,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.MarkAsComplete,
    [StageType.Review]: StageActionType.MarkAsComplete,
    [StageType.Test]: StageActionType.MarkAsComplete,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.ConsensusEntrypoint]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.ConsensusTest]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToNextReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Logic]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Discard]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  },
  [StageType.Webhook]: {
    [StageType.Archive]: StageActionType.SendToArchive,
    [StageType.Annotate]: StageActionType.SendToAnnotate,
    [StageType.Code]: StageActionType.SendToCode,
    [StageType.Complete]: StageActionType.MarkAsComplete,
    [StageType.ConsensusEntrypoint]: StageActionType.SendToConsensus,
    [StageType.ConsensusTest]: StageActionType.SendToTest,
    [StageType.Logic]: StageActionType.SendToLogic,
    [StageType.Model]: StageActionType.SendToModel,
    [StageType.Review]: StageActionType.SendToReview,
    [StageType.Test]: StageActionType.SendToTest,
    [StageType.Discard]: StageActionType.Archive,
    [StageType.Webhook]: StageActionType.SendToWebhook
  }
}

/**
 * Return basic mapping when transitioning between two stages of specified types,
 * as for "from" => "to" => "action"
 *
 * This menas that transitioning from "from" type to "to" type implies the
 * returned action is happening.
 *
 * This is mainly used to decide which text to show on the continue button label.
 */
export const mapStageActiontype = (
  from: StageType,
  to: Exclude<StageType, StageType.Dataset>
): StageActionType =>
  MAPPING[from][to]
