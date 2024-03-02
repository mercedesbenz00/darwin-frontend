/**
 * Represents a comment conversation made in a workview.
 *
 * A conversation starts by drawing a bounding box on top of an item slot,
 * followed by typing out the comment itself.
 *
 * This creates the thread with a single comment
 *
 * Once there, other users can post replies to the same thread which adds
 * additional comments to it.
 *
 * The comment thread author can eventually resolve the thread, which will make
 * it no longer be listed.
 *
 * If the thread is created on a simple item, it will be associated to the item
 * and the single slot of the item.
 *
 * If it's a multi slot item, it will be associated to the item and one of the
 * item slots.
 *
 * If it's a video, it will additionally be associated to a frame of the video.
 */

export type V2CommentThreadPayload = {
  /* eslint-disable camelcase */
  /**
   * User id of the user who created the comment thread
   */
  author_id: number
  /**
   * Position of the comment thread on top of a slot in an item
   */
  bounding_box: { x: number; y: number; w: number; h: number }
  /**
   * Total number of comments the thread contains
   */
  comment_count: number
  /**
   * Types of issues that caused the thread to be created by system user
   */
  issue_types: string[] | null
  /**
   * Data describing which annotations didn't satisfy the IoU threshold
   */
  issue_data: IssueDataPayload | null
  /**
   * Id of the 2.0 dataset item the thread is created for
   */
  dataset_item_id: string
  /**
   * UUID of the thread itself
   */
  id: string
  /**
   * Timestamp of then the thread was first created
   */
  inserted_at: string
  /**
   * Flag indicating whether the comment thread is resolved.
   * Once resolved, the thread will no longer be sent by the backend.
   */
  resolved: boolean
  /**
   * Index of the section of a multi-section slot
   */
  section_index: number | null
  /**
   * Name of the slot the thread relates to
   */
  slot_name: string
  /**
   * Timestamp of the last moment the thread was updated.
   * Updating a comment belonging to the thread does NOT update this timestamp.
   */
  updated_at: string
  /* eslint-enable camelcase */
}

type IssueDataPayload = {
  annotation_ids: string[]
  disagreement: {
    ious: [
      {
        champion_annotation_id: string
        other_annotation_id: string
        // 0 to 1
        iou: number
      }
    ] | null
  } | null
}
