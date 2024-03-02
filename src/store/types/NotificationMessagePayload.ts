import { NotificationPayload } from './NotificationPayload'

/**
 * Structure for a "notifications" message received through the notifications websocket channel
 */
export type NotificationMessagePayload = {
  /* eslint-disable camelcase */
  /** New (or updated?) notifications to be pushed into store */
  notifications?: NotificationPayload[]
  /** Unread counts by team, where structure for a single item is [team_id, unread_count] */
  by_team_unread_count?: [number, number][]
  /** Deleted notification ids that ought to be removed from store. */
  deleted_notifications?: number[]
  /* eslint-enable camelcase */
}
