import 'testcafe'

import AnnotatorTaskModel from '../models/annotatorTasks.model'
import DatasetManagementModel from '../models/dataset/datasetManagement.model'
import LoadingSpinnerModel from '../models/loadingSpinner.model'
import DatasetsModel from '../models/datasets.model'
import DatasetModel from '../models/dataset/dataset.model'
import SidebarModel from '../models/sidebar.model'
import WorkviewModel from '../models/workview.model'

import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory, FactoryRecord } from '../utils/factory'
import { stripeStub, uiLogin } from '../utils/helpers'

const annotatorTasksPage = new AnnotatorTaskModel()
const datasetManagementPage = new DatasetManagementModel()
const { dataTab, tasksTab } = datasetManagementPage
const loadingSpinner = new LoadingSpinnerModel('.workview__center__main__area')
const datasetsPage = new DatasetsModel()
const datasetPage = new DatasetModel()
const sidebarComponent = new SidebarModel()
const workviewPage = new WorkviewModel()
const { toolBar, commentThread } = workviewPage

let data: {
  dataset: FactoryRecord
  datasetImages: FactoryRecord[]
}

let team: FactoryRecord

fixture('Comment')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)

    const owner = await t.ctx.factory.create('user', { password: 'Password1' })
    team = await t.ctx.factory.create('team')
    await t.ctx.factory.create('customer', { team })
    await t.ctx.factory.create('membership', { user: owner, team, role: 'owner' })

    // Create annotator
    const annotator = await t.ctx.factory.create('user', { password: 'Password1' })
    await t.ctx.factory.create('membership', { user: annotator, team, role: 'annotator' })

    data = await t.ctx.factory.seed(team)

    await t.ctx.factory.create('dataset_annotator', { user: annotator, dataset: data.dataset })

    // Create another user
    const teamMember = await t.ctx.factory.create('user', { password: 'Password1' })
    await t.ctx.factory.create('membership', { user: teamMember, team, role: 'member' })

    t.ctx.users = { annotator, owner, teamMember }
    return t
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('Use comment tools to comment picture', async t => {
  const { owner } = t.ctx.users
  await uiLogin(t, owner.email, 'Password1')

  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })

  await workviewPage.drawBox(10, 10, 20, 20)
  await t
    .expect(commentThread.container.exists).ok()
    .typeText(commentThread.replyBox.textarea, 'comment 1')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.count).eql(1)
    .expect(commentThread.comments.withText('comment 1').exists).ok()
    .typeText(commentThread.replyBox.textarea, 'comment 2')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.comments.count).eql(2)
    .expect(commentThread.comments.withText('comment 2').exists).ok()

  // Cancel button should hide profile & action buttons
  await t
    .click(commentThread.replyBox.textarea)
    .click(commentThread.replyBox.cancelBtn)
    .expect(commentThread.replyBox.actions.exists).notOk()
    .expect(commentThread.replyBox.profile.exists).notOk()

  // Clicking outside the comment thread should hide the comment thread
  await t
    .click(workviewPage.canvas, { offsetX: 1, offsetY: 1 })
    .expect(commentThread.container.exists).notOk()

  // Clicking inside the comment thread should show the comment thread
  await t
    .click(toolBar.comment)
    .click(workviewPage.canvas, { offsetX: 20, offsetY: 20 })
    .click(commentThread.commentItem.profileMoreButton(0))
    .expect(commentThread.commentItem.overlayEditComment.exists).ok()
    .expect(commentThread.commentItem.overlayDeleteComment.exists).ok()
    .expect(commentThread.commentItem.overlayDeleteThread.exists).ok()

  // Edit existing comment
  await t
    .click(commentThread.commentItem.overlayEditComment)
    .expect(commentThread.commentItem.editTextarea.exists).ok()
    .typeText(commentThread.commentItem.editTextarea, 'edited')
    .click(commentThread.commentItem.editSaveButton)
    .expect(commentThread.comments.withText('edited').exists).ok()

  // Delete existing comment
  await t
    .click(toolBar.comment)
    .click(workviewPage.canvas, { offsetX: 20, offsetY: 20 })
    .click(commentThread.commentItem.profileMoreButton(1))
    .click(commentThread.commentItem.overlayDeleteComment)
    .expect(commentThread.comments.count).eql(1)

  // Delete existing comment thread
  await t
    .click(toolBar.comment)
    .click(workviewPage.canvas, { offsetX: 15, offsetY: 15 })
    .click(commentThread.commentItem.profileMoreButton(0))
    .click(commentThread.commentItem.overlayDeleteThread)
    .expect(commentThread.container.exists).notOk()
})

test('Posting and replying comment between owner and annotator', async t => {
  const { annotator, owner } = t.ctx.users
  await uiLogin(t, owner.email, 'Password1')

  const { dataset, datasetImages: [image] } = data
  await workviewPage.setViewedInstructions(dataset.id)

  const task = await t.ctx.factory.create('task', { dataset, user: annotator })
  t.ctx.factory.create('dataset_image_task_status', { task, dataset_image: image })

  await datasetsPage.openDataset(0)
  await datasetManagementPage.goToTasks()
  await tasksTab.openTask(0)

  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })

  await workviewPage.drawBox(10, 10, 20, 20)
  await t
    .expect(commentThread.container.exists).ok()
    .typeText(commentThread.replyBox.textarea, 'comment for annotator')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.count).eql(1)
    .expect(commentThread.comments.withText('comment for annotator').exists).ok()

  // Logout as owner
  await t.click(workviewPage.topBar.backButton)
  await sidebarComponent.logout()

  // Log in as annotator
  await uiLogin(t, annotator.email, 'Password1')
  await annotatorTasksPage.openTask(0)
  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })
    // Clicking inside the comment thread should show the comment thread
    .click(workviewPage.canvas, { offsetX: 15, offsetY: 15 })
    .expect(commentThread.container.exists).ok()
    .typeText(commentThread.replyBox.textarea, 'comment by annotator')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.count).eql(2)
    .expect(commentThread.comments.withText('comment by annotator').exists).ok()

  await t.click(workviewPage.topBar.backButton)
  await sidebarComponent.logout()

  // Log in as Owner again
  await uiLogin(t, owner.email, 'Password1')

  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()
  await datasetManagementPage.goToTasks()
  await tasksTab.openTask(0)

  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })
    .click(workviewPage.canvas, { offsetX: 15, offsetY: 15 })
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.withText('comment by annotator').exists).ok()
    .expect(commentThread.comments.count).eql(2)
    .expect(commentThread.replyBox.textarea.exists).ok({ timeout: 10000 })
    .typeText(commentThread.replyBox.textarea, 'reply to annotator')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.comments.count).eql(3)
})

test('Use comment tools between users', async t => {
  const { owner } = t.ctx.users
  await uiLogin(t, owner.email, 'Password1')
  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })

  await workviewPage.drawBox(10, 10, 20, 20)
  await t
    .expect(commentThread.container.exists).ok()
    .typeText(commentThread.replyBox.textarea, 'comment for other user')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.count).eql(1)
    .expect(commentThread.comments.withText('comment for other user').exists).ok()

  await t.click(workviewPage.topBar.backButton)
  await sidebarComponent.logout()

  const { teamMember } = t.ctx.users

  await uiLogin(t, teamMember.email, 'Password1')
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  await t
    .click(toolBar.comment)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })
    .click(workviewPage.canvas, { offsetX: 15, offsetY: 15 })
    .expect(commentThread.container.exists).ok()
    .typeText(commentThread.replyBox.textarea, 'reply to other user')
    .click(commentThread.replyBox.postBtn)
    .expect(commentThread.container.exists).ok()
    .expect(commentThread.comments.count).eql(2)
    .expect(commentThread.comments.withText('reply to other user').exists).ok()
})
