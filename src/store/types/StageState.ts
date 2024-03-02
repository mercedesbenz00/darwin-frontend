/**
 * Defines all possible current states of a stage
 *
 * These are mapped based on the schema
 *
 * `{StateSageIsIn}{ActionBeingPerformed}`
 */
export enum StageState {
  AnnotationSendingToAnnotate = 'annotation-sending-to-annotate',
  AnnotationSendingToCode = 'annotation-sending-to-code',
  AnnotationSendingToComplete = 'annotation-sending-to-complete',
  AnnotationSendingToModel = 'annotation-sending-to-model',
  AnnotationSendingToReview = 'annotation-sending-to-review',
  AnnotationSendingToTest = 'annotation-sending-to-test',
  AnnotationSkipping = 'annotation-skipping',
  ModelSendingToAnnotate = 'model-sending-to-annotate',
  ModelSendingToCode = 'model-sending-to-code',
  ModelSendingToComplete = 'model-sending-to-complete',
  ModelSendingToModel = 'model-sending-to-model',
  ModelSendingToReview = 'model-sending-to-review',
  ModelSendingToTest = 'model-sending-to-test',
  ReviewArchiving = 'review-archiving',
  ReviewSendingBack = 'review-sending-back',
  ReviewSendingToAnnotate = 'review-sending-to-annotate',
  ReviewSendingToCode = 'review-sending-to-code',
  ReviewSendingToComplete = 'review-sending-to-complete',
  ReviewSendingToModel = 'review-sending-to-model',
  ReviewSendingToReview = 'review-sending-to-review',
  ReviewSendingToTest = 'review-sending-to-test',
  CodeSendingToAnnotate = 'code-sending-to-annotate',
  CodeSendingToCode = 'code-sending-to-code',
  CodeSendingToComplete = 'code-sending-to-complete',
  CodeSendingToModel = 'code-sending-to-model',
  CodeSendingToReview = 'code-sending-to-review',
  CodeSendingToTest = 'code-sending-to-test',
  TestSendingToReview = 'test-sending-to-review'
}
