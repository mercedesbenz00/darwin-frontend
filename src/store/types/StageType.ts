/**
 * Lists all supported workflow stage types
 */
export enum StageType {
  /**
   * Type of workflow terminal stage where items are automatically archived.
   *
   */
  Archive = 'archive',

  /**
   * Type of workflow stage where the user primarily annotates the image.
   *
   * Can be marked as skipped, indicating there's something wrong with the image.
   * Can be manually marked as done without creating any annotations.
   */
  Annotate = 'annotate',

  /**
   * Entrypoint to a composite "consensus" stage that combines multiple annotate/model
   * stages and a test stage into a single one that is completed when above configured IoU.
   */
  ConsensusEntrypoint = 'consensus_entrypoint',

  /**
   * The exit stage of the V2 consensus stage that runs IoU computations.
   */
  ConsensusTest = 'consensus_test',

  /**
   * Final stage type with no practical use, except to serve as an end state to the workflow.
   *
   * No changes to annotations can be made once the item reaches this stage.
   */
  Complete = 'complete',
  /**
   * An entry stage which connects the workflow with a dataset
   */
  Dataset = 'dataset',
  /**
   * Special type implicitly part of any V2 workflow.
   * Skipped items in a V2 workflow end up in this stage
   */
  Discard = 'discard',
  /**
   * Type of workflow stage where the user primarily reviewes another user's annotations.
   *
   * Depending on settings, the user might also be able to create or modify annotations.
   *
   * Can be marked as archived, indicating there's something wrong with the item and archiving it.
   *
   * Can be rejected, sending the item back to the previous stage.
   *
   * Can be approved, sending the item to the next stage, if it was annotated,
   * or archiving it if it was marked as skipped.
   */
  Review = 'review',

  /**
   * A stage which simply executes a model
   */
  Model = 'model',

  Logic = 'logic',

  /**
   * A stage which runs specified code on input data, to produce output data
   */
  Code = 'code',

  /**
   * A read-only stage which runs a task, then has two output depending on the
   * task succeeding or failing
   */
  Webhook = 'webhook',

  /**
   * A stage which must always run after a blind/consensus/parallel annotate stage
   */
  Test = 'test'
}
