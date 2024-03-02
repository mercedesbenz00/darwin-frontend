import { v4 } from 'uuid'

import { buildNotificationPayload } from 'test/unit/factories'

import { replaceableRegex } from '@/utils'
import {
  buildLink,
  buildStrong,
  extractComment,
  extractData,
  formatComment,
  formatNewDatasetVersion,
  formatPaymentFailed,
  formatWorkAssigned,
  trimComment,
  workflowUrl
} from '@/utils/notification'

describe('buildLink', () => {
  it('build link from href and text', () => {
    expect(buildLink('https://v7labs.com', 'V7'))
      .toEqual('<a class="notification-item__text_link" href="https://v7labs.com">V7</a>')
  })
})

describe('buildStrong', () => {
  it('build strong html from text', () => {
    expect(buildStrong('V7')).toEqual('<strong class="notification-item__bold">V7</strong>')
  })
})

describe('extractComment', () => {
  it('extracts comment from notification payload', () => {
    const notification = buildNotificationPayload({
      parsed: 'Notification [Comment:comment for [Member:1;test]]'
    })
    expect(extractComment(notification)).toEqual('[Comment:comment for [Member:1;test]]')
  })
})

describe('extractData', () => {
  it('extracts data from notification payload', () => {
    const notification = buildNotificationPayload({ parsed: '[Dataset:V7 Dataset]' })
    const { match, value } = extractData(notification, replaceableRegex('Dataset'))
    expect(match).toEqual('[Dataset:V7 Dataset]')
    expect(value).toEqual('V7 Dataset')
  })
})

describe('formatComment', () => {
  it('formats a v2 comment notification payload', () => {
    const uid = v4()
    const notification = buildNotificationPayload({
      parsed: [
        `[User:Sam] commented on [Workflow:2] [DatasetItem:${uid}] [Dataset:V7]:`,
        '[Comment:[Mention:5;Tom] Test Notification].'
      ].join(' ')
    })
    expect(formatComment(notification))
      .toEqual([
        '<strong class="notification-item__bold">Sam</strong>',
        'commented on',
        `<a class="notification-item__text_link" href="/workview?dataset=-1&item=${uid}">Item</a>`,
        'in',
        `<a class="notification-item__text_link" href="/workview?dataset=-1&item=${uid}">V7</a>:`,
        '“<span id="5" class="member-mentioned">@Tom</span>&nbsp;', 'Test Notification”.'
      ].join(' '))
  })

  it('formats comment notification payload', () => {
    const notification = buildNotificationPayload({
      parsed: [
        '[User:Sam] commented on [Workflow:2] [DatasetItem:2] [Dataset:V7]:',
        '[Comment:[Mention:5;Tom] Test Notification].'
      ].join(' ')
    })
    expect(formatComment(notification))
      .toEqual([
        '<strong class="notification-item__bold">Sam</strong>',
        'commented on',
        '<a class="notification-item__text_link" href="/workview?dataset=-1&image=2">Item 2</a>',
        'in',
        '<a class="notification-item__text_link" href="/workview?dataset=-1&image=2">V7</a>:',
        '“<span id="5" class="member-mentioned">@Tom</span>&nbsp;', 'Test Notification”.'
      ].join(' '))
  })
})

describe('formatNewDatasetVersion', () => {
  it('formats new-dataset-version notification payload', () => {
    const notification = buildNotificationPayload({ parsed: '[Dataset:V7]', dataset_id: 1 })
    expect(formatNewDatasetVersion(notification))
      .toEqual('<a class="notification-item__text_link" href="/datasets/1?export">V7</a>')
  })
})

describe('formatPaymentFailed', () => {
  it('formats payment-failed notification payload', () => {
    const notification = buildNotificationPayload({ parsed: '[Team:V7]' })
    expect(
      formatPaymentFailed(notification)
    ).toEqual('<a class="notification-item__text_link" href="/datasets?settings=plans">V7</a>')
  })
})

describe('formatWorkAssigned', () => {
  it('formats work-assigned notification payload', () => {
    const uu1 = v4()
    const uu2 = v4()
    const notification = buildNotificationPayload({
      parsed: `[User:Test] assigned you [Info:2;${uu1},${uu2}] in [Dataset:V7].`,
      dataset_id: 1
    })
    expect(formatWorkAssigned(notification)).toEqual([
      '<strong class="notification-item__bold">Test</strong>',
      'assigned you',
      `<a class="notification-item__text_link" href="/workview?dataset=1&item=${uu1}">2 tasks</a>`,
      'in',
      `<a class="notification-item__text_link" href="/workview?dataset=1&item=${uu1}">V7</a>.`
    ].join(' '))
  })

  it('formats a v2 work-assigned notification payload', () => {
    const notification = buildNotificationPayload({
      parsed: '[User:Test] assigned you [Info:2;3,4,5] in [Dataset:V7].',
      dataset_id: 1
    })
    expect(formatWorkAssigned(notification)).toEqual([
      '<strong class="notification-item__bold">Test</strong>',
      'assigned you',
      '<a class="notification-item__text_link" href="/workview?dataset=1&image=3">2 tasks</a>',
      'in',
      '<a class="notification-item__text_link" href="/workview?dataset=1&image=3">V7</a>.'
    ].join(' '))
  })
})

describe('trimComment', () => {
  it('trims comments', () => {
    const comment = trimComment(new Array(143).join('$'))
    expect(comment).toHaveLength(140)
    expect(comment.substring(137)).toEqual('...')
  })
})

describe('workflowUrl', () => {
  it('returns workflow url from datasetId and seq', () => {
    expect(workflowUrl(1, '2')).toEqual('/workview?dataset=1&image=2')
  })
})
