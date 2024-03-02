/**
 * Enumerates all possible workview actions or final states
 *
 * For actions, this is used when determining what performing the default action on a stage can do.
 *
 * For final states, this is used when determining which final state the stage is in.
 */
export enum StageActionType {
  /** Item is set to be archived */
  Archive = 'archive',
  /** Item has already been archived */
  Archived = 'archived',
  /** Item is part of an already completed workflow */
  Completed = 'completed',
  /** Items is in the final stage and is about to be approved */
  MarkAsComplete = 'mark-as-complete',
  /** Item is new and not part of a workflow */
  New = 'new',
  /**
   * Item is about to be approved/completed in this stage
   * and the next stage is an "annotate" stage
   */
  SendToArchive = 'send-to-archive',
  /**
   * Item is about to be approved/completed in this stage
   * and the next stage is an "annotate" stage
   */
  SendToAnnotate = 'send-to-annotate',
  /**
   * Next stage is consensus, item is currently in any stage
   */
  SendToConsensus = 'send-to-consensus',
  /**
   * Item is about to be rejected from the current stage and
   * will go back to previous stage
   */
  SendBack = 'send-back',
  /**
   * Item is in review stage and is about to be sent to the next review stage.
   *
   * This is a special type of action because it needs to be worded differently in the UI.
   * "Send to review" from a review stage is confusing.
   * Instead, the ui will show "Send to next stage", in review colors.
   *
   */
  SendToNextReview = 'send-to-next-review',
  /** Item is in annotate stage and is about to be sent to review stage */
  SendToReview = 'send-to-review',
  /** Item is in annotate stage and is marked to be skipped */
  Skip = 'skip',
  /**
   * Next stage is model, item is currently in any stage
   */
  SendToLogic = 'send-to-logic',
  /**
   * Next stage is model, item is currently in any stage
   */
  SendToModel = 'send-to-model',
  /**
   * Next stage is code, item is currently in any stage
   */
  SendToCode = 'send-to-code',

  /**
   * Next stage is test, item is currently technically in any,
   * but realistically could only be annotate stage
   */
  SendToTest = 'send-to-test',

  /**
   * Next stage is webhook, altough this stage's read-only
   */
  SendToWebhook = 'send-to-webhook'
}
