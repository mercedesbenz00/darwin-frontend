import { NotificationPayload } from '@/store/types'

import { commentToHtml } from './comment'
import { replaceableRegex } from './regex'
import { findClosingBracketIndex } from './string'

export const COMMENT_BODY_LIMIT = 140

/**
 * Verifies if the specified string is loosely a uuid
 *
 * By "loosely", we mean it doesn't strictly follows the uuid specification, but
 * does have the general uuid shape of 5 strings joined by dashes.
 *
 * We do this loose check because `uuid/validate` in fact returns `false` for our
 * backend-generared uuids
 */
const isLooselyUuid = (seqOrV2Uuid: string): boolean => seqOrV2Uuid.split('-').length === 5

export const workflowUrl = (datasetId: number, seqOrV2Uuid: string): string =>
  isLooselyUuid(seqOrV2Uuid)
    // The workview 2.0 is subject to change, but at the very least, the item param should be
    // "item", not "image"
    ? `/workview?dataset=${datasetId}&item=${seqOrV2Uuid}`
    : `/workview?dataset=${datasetId}&image=${seqOrV2Uuid}`

const workflowText = (datasetId: number, seqOrV2Uuid: string): string =>
  isLooselyUuid(seqOrV2Uuid)
    // we don't want to rely on sequences in V2, so we don't really show anything about the item
    ? 'Item'
    : `Item ${seqOrV2Uuid}`

export const buildLink = (href: string, text: string): string =>
  `<a class="notification-item__text_link" href="${href}">${text}</a>`

export const buildStrong = (text: string): string =>
  `<strong class="notification-item__bold">${text}</strong>`

type Data = {
  match: string
  value: string
}

/**
 * Extracts data from notification.parsed using the specified regex.
 */
export const extractData = (notification: NotificationPayload, regex: RegExp): Data => {
  const [match, , value] = notification.parsed.match(regex) || ['', '', '']
  return { match, value }
}

export const extractComment = (notification: NotificationPayload): string => {
  const { match: commentString } = extractData(notification, replaceableRegex('Comment'))
  const { parsed } = notification
  const startIndex = parsed.indexOf(commentString)
  const endIndex = findClosingBracketIndex(parsed, startIndex)

  if (endIndex === -1) { return '' }

  return parsed.substring(startIndex, endIndex + 1)
}

/**
 * Trims function to globally specified max length, by adding a "..." to the end.
 *
 * If comment is under max length, this is a no-op.
 */
export const trimComment = (comment: string): string => comment.length > COMMENT_BODY_LIMIT
  ? comment.slice(0, COMMENT_BODY_LIMIT - 3).trim().concat('...')
  : comment

/**
 * Formats rendered html for a workflow comment notification, out of `notification.parsed`.
 *
 * The 1.0 version doesn't need anything except the data already present in notification
 * Once a full switch to 2.0 is made, we will need to pass in the current team and potentially
 * dataset to, to get access to their respective slugs
 */
export const formatComment = (notification: NotificationPayload): string => {
  const { parsed } = notification

  const {
    match: datasetString,
    value: datasetName
  } = extractData(notification, replaceableRegex('Dataset'))

  const { match: workflowString } = extractData(notification, replaceableRegex('Workflow'))
  const {
    match: userString,
    value: userName
  } = extractData(notification, replaceableRegex('User'))

  const {
    match: itemString,
    value: seqOrV2Uuid
  } = extractData(notification, replaceableRegex('DatasetItem'))

  const commentString = extractComment(notification)
  // remove the prefix `[Comment:` and suffix `]`
  const fullComment = commentString.substring('[Comment:'.length).slice(0, -1)
  const trimmedComment = trimComment(commentToHtml(fullComment))

  const url = workflowUrl(notification.dataset_id, seqOrV2Uuid)
  const text = workflowText(notification.dataset_id, seqOrV2Uuid)

  return parsed
    .replace(itemString, `${buildLink(url, text)} in`)
    .replace(workflowString, '')
    .replace(datasetString, buildLink(url, datasetName))
    .replace(userString, buildStrong(userName))
    .replace(commentString, `“${trimmedComment}”`)
    .replace('  ', ' ')
}

/**
 * Formats rendered html for a work related notification, out of `notification.parsed`.
 *
 * This includes
 * - work assigned
 * - work rejected
 * - work approved
 *
 * The 1.0 version doesn't need anything except the data already present in notification
 * Once a full switch to 2.0 is made, we will need to pass in the current team and potentially
 * dataset to, to get access to their respective slugs
 */
export const formatWorkAssigned = (notification: NotificationPayload): string => {
  const { parsed } = notification
  const {
    match: datasetString,
    value: datasetName
  } = extractData(notification, replaceableRegex('Dataset'))
  const {
    match: userString,
    value: userName
  } = extractData(notification, replaceableRegex('User'))
  const {
    match: infoString,
    value: info
  } = extractData(notification, replaceableRegex('Info'))

  // format here is {count};{seqOrUUID},{seqOrUuid},..
  const [count, sequences] = info.split(';')
  const [seq] = sequences.split(',')

  const url = workflowUrl(notification.dataset_id, seq)

  return parsed
    .replace(datasetString, buildLink(url, datasetName))
    .replace(userString, buildStrong(userName))
    .replace(infoString, buildLink(url, count === '1' ? 'a task' : `${count} tasks`))
}

export const formatPaymentFailed = (notification: NotificationPayload): string => {
  const { parsed } = notification
  const { match, value } = extractData(notification, replaceableRegex('Team'))
  const url = '/datasets?settings=plans'

  return parsed.replace(match, buildLink(url, value))
}

export const formatNewDatasetVersion = (notification: NotificationPayload): string => {
  const { parsed } = notification
  const { match, value } = extractData(notification, replaceableRegex('Dataset'))
  const url = `/datasets/${notification.dataset_id}?export`

  return parsed.replace(match, buildLink(url, value))
}
