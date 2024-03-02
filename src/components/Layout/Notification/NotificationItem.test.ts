import { createLocalVue, shallowMount } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildNotificationPayload } from 'test/unit/factories'

import NotificationItem from '@/components/Layout/Notification/NotificationItem.vue'
import { NotificationPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)
localVue.directive('observe-visibility', () => { })

let router: Router
let store: ReturnType<typeof createTestStore>
let propsData: {
  notification: NotificationPayload,
  isOldest?: boolean
}

type INotificationItem = Vue & {
  visibilityChanged: (change: boolean) => void
}

const createRouter = (): Router => {
  const router =
    new Router({
      routes: [
        { name: 'Workflow', path: '/workview' }
      ]
    })

  router.push('/')

  return router
}

beforeEach(() => {
  router = createRouter()
  store = createTestStore()
  propsData = {
    notification: buildNotificationPayload({})
  }
})

const twentyYearsAgo = ((): string => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 20)
  return date.toISOString()
})()

const itRendersIcon = (): void => it('renders icon', () => {
  const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
  expect(wrapper.find('.notification-item__icon').exists()).toBe(true)
})

const itDoesNotRenderIcon = (): void => it('does not render icon', () => {
  const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
  expect(wrapper.find('.notification-item__icon').exists()).toBe(false)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
  expect(wrapper.element).toMatchSnapshot()
})

const itRendersStrong = (type: string, name: string): void =>
  it(`renders ${type} as bold`, () => {
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    const strong = wrapper
      .findAll('strong.notification-item__bold')
      .wrappers.find(w => w.text() === name)
    expect(strong && strong.exists()).toBe(true)
  })

const itRendersLink = (type: string, textToRemove: string, text: string, url: string): void =>
  it(`renders ${type} as link`, () => {
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    expect(wrapper.html()).not.toContain(textToRemove)
    const link = wrapper
      .findAll('a.notification-item__text_link')
      .wrappers.find(w => w.text() === text)

    expect(!!link && link.exists()).toBe(true)
    expect(!!link && link.attributes('href')).toEqual(url)
  })

const itRemoves = (type: string, text: string): void => it(`removes ${type}`, () => {
  const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
  expect(wrapper.html()).not.toContain(text)
})

const itRendersAsIs = (): void => it('renders as is', () => {
  const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
  expect(wrapper.text()).toContain(propsData.notification.parsed)
  expect(wrapper.text()).toContain(propsData.notification.title)
})

describe('account_limit_reached', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'Free tier limit reached on [Team:V7]. Upgrade to keep using Darwin.',
      team_id: 7,
      title: 'Account Limit Reached',
      type: 'account_limit_reached'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersLink('team', '[Team:V7]', 'V7', '/datasets?settings=plans')

  it('redirects to plans tab 1', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith({ query: { settings: 'plans' } })
  })
})

describe('new_dataset_version', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      dataset_id: 5,
      inserted_at: twentyYearsAgo,
      parsed: 'A version of [Dataset:SFH] is ready to download.',
      title: 'New Dataset Version',
      type: 'new_dataset_version'
    })
  })

  itMatchesSnapshot()
  itDoesNotRenderIcon()
  itRendersLink('dataset', '[Dataset:SFH]', 'SFH', '/datasets/5?export')
})

describe('payment_failed', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: [
        'There was a problem with the monthly payment on [Team:V8].',
        'Please check your billing information.'
      ].join(' '),
      team_id: 8,
      title: 'Payment Failed',
      type: 'payment_failed'
    })
  })

  itMatchesSnapshot()
  itDoesNotRenderIcon()
  itRendersLink('team', '[Team:V8]', 'V8', '/datasets?settings=plans')

  it('redirects to plans tab 2', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith({ query: { settings: 'plans' } })
  })
})

describe('task_assigned', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'Task 1 in My Dataset assigned.',
      title: 'New Task Assigned',
      type: 'task_assigned'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersAsIs()
})

describe('task_approved', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'Reviewer reviewed Task 1 in My Dataset.',
      title: 'Task Complete',
      type: 'task_approved'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersAsIs()
})

describe('task_image_comment', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'User 1 commented in the Task: 1 DatasetImage: 1 Dataset: SFH: "Foo comment"',
      title: 'New Comment Added',
      type: 'task_image_comment'
    })
  })

  itMatchesSnapshot()
  itDoesNotRenderIcon()
  itRendersAsIs()
})

describe('task_rejected', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'Reviewer reviewed Task 1 in My Dataset and some images require corrections.',
      title: 'Task Requires Corrections',
      type: 'task_rejected'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersAsIs()
})

describe('task_ready_for_review', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      inserted_at: twentyYearsAgo,
      parsed: 'User 1 finished annotating Task 1 in My Dataset.',
      title: 'Ready for Review',
      type: 'task_ready_for_review'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersAsIs()
})

describe('work_assigned, single item', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      dataset_id: 5,
      inserted_at: twentyYearsAgo,
      parsed: '[User:John Doe] assigned you [Info:1;2] in [Dataset:SFH].',
      title: 'New Task Assigned',
      type: 'work_assigned'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersStrong('user', 'John Doe')
  itRendersLink('items', '[Info:1;2]', 'a task', '/workview?dataset=5&image=2')
  itRendersLink('dataset', '[Dataset:SFH]', 'SFH', '/workview?dataset=5&image=2')

  it('redirects to workview', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith('/workview?dataset=5&image=2')
  })
})

describe('work_assigned, multiple items', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      dataset_id: 5,
      inserted_at: twentyYearsAgo,
      parsed: '[User:John Doe] assigned you [Info:2;3,4] in [Dataset:SFH].',
      title: 'New Task Assigned',
      type: 'work_assigned'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersStrong('user', 'John Doe')
  itRendersLink('items', '[Info:2;3,4]', '2 tasks', '/workview?dataset=5&image=3')
  itRendersLink('dataset', '[Dataset:SFH]', 'SFH', '/workview?dataset=5&image=3')

  it('redirects to workview', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith('/workview?dataset=5&image=3')
  })
})

describe('work_rejected, single item', () => {
  beforeEach(() => {
    propsData.notification = buildNotificationPayload({
      dataset_id: 5,
      inserted_at: twentyYearsAgo,
      parsed: '[User: John Doe] reviewed [Info:1;4] in [Dataset:SFH] and it requires corrections',
      title: 'Task Requires Corrections',
      type: 'work_rejected'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersStrong('user', 'John Doe')
  itRendersLink('items', '[Info:1;2]', 'a task', '/workview?dataset=5&image=4')
  itRendersLink('dataset', '[Dataset:SFH]', 'SFH', '/workview?dataset=5&image=4')

  it('redirects to workview', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith('/workview?dataset=5&image=4')
  })
})

describe('workflow_image_comment', () => {
  let comment: string

  beforeEach(() => {
    comment = [
      'Very long comment way more than 140 chars which is what the upper limit for comments in',
      'notifications is. Let us add a few more words just in case. And maybe another two or three'
    ].join(' ')
    propsData.notification = buildNotificationPayload({
      dataset_id: 5,
      inserted_at: twentyYearsAgo,
      parsed: [
        '[User:John Doe] commented on',
        `[Workflow:1] [DatasetItem:7] [Dataset:SFH]: [Comment: ${comment}]`
      ].join(' '),
      title: 'New comment added',
      type: 'workflow_image_comment'
    })
  })

  itMatchesSnapshot()
  itRendersIcon()
  itRendersStrong('user', 'John Doe')
  itRendersLink('item', '[DatasetItem:7]', 'Item 7', '/workview?dataset=5&image=7')
  itRendersLink('dataset', '[Dataset:SFH]', 'SFH', '/workview?dataset=5&image=7')
  itRemoves('workflow', '[Workflow:1]')

  it('trims comment', () => {
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    expect(wrapper.html()).not.toContain(comment)
    expect(wrapper.html()).not.toContain('[Body:')
    expect(wrapper.html()).toContain(comment.substr(0, 136).concat('...'))
  })

  it('redirects to workview', async () => {
    const router = createRouter()
    jest.spyOn(router, 'push')

    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    await wrapper.find('.notification-item__header').trigger('click')

    expect(router.push).toHaveBeenCalledWith('/workview?dataset=5&image=7')
  })
})

describe('read status', () => {
  it('renders as read if notification is read', () => {
    const propsData = {
      notification: buildNotificationPayload({ is_read: true }),
      isOldest: false
    }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    expect(wrapper.find('.notification-item--read').exists()).toBe(true)
  })

  it('renders as unread if notification is not read', () => {
    const propsData = {
      notification: buildNotificationPayload({ is_read: false }),
      isOldest: false
    }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })
    expect(wrapper.find('.notification-item--read').exists()).toBe(false)
  })
})

describe('beforeDestroy', () => {
  const readNotification = buildNotificationPayload({ id: 5, is_read: true })
  const unreadNotification = buildNotificationPayload({ id: 6, is_read: false })

  it('marks notification as read if it was visible and is unread', () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const propsData = { notification: unreadNotification }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    const component = (wrapper.vm as INotificationItem)
    component.visibilityChanged(true)
    wrapper.destroy()

    expect(store.dispatch).toHaveBeenCalledWith('notification/markNotificationRead', 6)
  })

  it('does not mark notification as read if it was not visible and is unread', () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const propsData = { notification: unreadNotification }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    wrapper.destroy()

    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does not mark notification as read if it was visible and is already read', () => {
    const propsData = { notification: readNotification }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    const component = (wrapper.vm as INotificationItem)
    component.visibilityChanged(true)
    wrapper.destroy()

    expect(store.dispatch).not.toHaveBeenCalled()
  })
})

describe('on visibility change', () => {
  const notification = buildNotificationPayload({ id: 5, is_read: true })

  it('retrieves more notifications if current one is oldest', () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const propsData = { notification, isOldest: true }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    const component = (wrapper.vm as INotificationItem)
    component.visibilityChanged(true)
    expect(store.dispatch).toHaveBeenCalledWith('notification/moreNotifications')
  })

  it('does nothing if current notification is not oldest', () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const propsData = { notification, isOldest: false }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    const component = (wrapper.vm as INotificationItem)
    component.visibilityChanged(true)
    expect(store.dispatch).not.toHaveBeenCalledWith('notification/moreNotifications')
  })

  it('does nothing if current notification is oldest and becomes invisible', () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const propsData = { notification, isOldest: true }
    const wrapper = shallowMount(NotificationItem, { localVue, propsData, store, router })

    const component = (wrapper.vm as INotificationItem)
    component.visibilityChanged(false)
    expect(store.dispatch).not.toHaveBeenCalledWith('notification/moreNotifications')
  })
})
