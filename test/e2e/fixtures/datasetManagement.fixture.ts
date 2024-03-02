import 'testcafe'

import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory } from '../utils/factory'
import { clientLogin, stripeStub } from '../utils/helpers'

import DatasetsModel from '../models/datasets.model'
import DatasetModel from '../models/dataset/dataset.model'
import DatasetManagementModel from '../models/dataset/datasetManagement.model'
import AddToDatasetModal from '../models/dataset/dialogs/addToDatasetModal.model'
import DropzoneModel from '../models/dataset/dropzone.model'
import ClassesModel from '../models/dataset/classes.model'

const datasetsPage = new DatasetsModel()

const datasetPage = new DatasetModel()

const datasetManagementPage = new DatasetManagementModel()
const { dataTab, tasksTab, archiveTab } = datasetManagementPage

fixture('Dataset Dataset Management')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)

    const user = await t.ctx.factory.create('user', {
      first_name: 'Joe', last_name: 'Owner', email: 'joe@v7labs.com', password: 'Password1'
    })
    const team = await t.ctx.factory.create('team')
    await t.ctx.factory.create('customer', { team })
    await t.ctx.factory.create('membership', { user, team, role: 'owner' })
    const { dataset, datasetImages } = await t.ctx.factory.seed(team)

    t.ctx.data = { team, dataset, datasetImages }

    await clientLogin(t, 'joe@v7labs.com', 'Password1')
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('add data to the dataset', async t => {
  await t.navigateTo('/datasets')
  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()

  await t.expect(dataTab.images.count).eql(10)

  // open upload dialog to add images to the dataset
  const addToDatasetModal = new AddToDatasetModal()
  await t
    .click(datasetManagementPage.addToDatasetButton)
    .expect(addToDatasetModal.modal.exists).ok()

  const dropzoneModel = new DropzoneModel()
  await dropzoneModel.dragDropFiles([
    '../../assets/test1.png',
    '../../assets/test2.png',
    '../../assets/test3.png',
    '../../assets/video.mp4'
  ])

  await t
    .click(addToDatasetModal.videoModal.submitButton)
    .expect(addToDatasetModal.sets.count).eql(1)
    .click(addToDatasetModal.uploadBtn)
    .expect(datasetManagementPage.uploadStatus.withText('100%').exists).ok()
    .expect(dataTab.images.count).eql(13, { timeout: 8000 })
    .expect(dataTab.videos.count).eql(1, { timeout: 13000 })

  // check video subroute
  await dataTab.openVideo(0)
  await t
    .expect(dataTab.images.count).eql(7, { timeout: 8000 })
})

test('image select/shift-select/escape/multiple-select', async t => {
  await t.navigateTo('/datasets')

  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()
  await dataTab.selectImage(0)

  await t.expect(dataTab.checkedCards.count).eql(1)

  await dataTab.shiftSelectImage(5)
  await t.expect(dataTab.checkedCards.count).eql(6)

  await dataTab.selectImage(8)
  await t.expect(dataTab.checkedCards.count).eql(7)

  await t.pressKey('esc')

  await t.expect(dataTab.checkedCards.count).eql(0)
})

test('image single/multiple archive/unarchive', async t => {
  await t.navigateTo('/datasets')

  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()

  await t.expect(dataTab.images.count).eql(10)

  // select one image and archive
  await dataTab.selectImage(0)
  await dataTab.shiftSelectImage(4)
  await dataTab.deleteSelection()

  // check image is gone
  await t.expect(dataTab.images.count).eql(5)

  await datasetManagementPage.goToArchive()

  // check image is on archive tab
  await t.expect(archiveTab.images.count).eql(5)

  await archiveTab.selectImage(0)
  await t.expect(archiveTab.checkedImages.count).eql(1)

  await archiveTab.shiftSelectImage(3)

  await archiveTab.selectImage(4)
  await t.expect(archiveTab.checkedImages.count).eql(5)

  await t.pressKey('esc')
  await t.expect(archiveTab.checkedImages.count).eql(0)
})

test('task creation/dissolve', async t => {
  const { team } = t.ctx.data

  const teamMember = await t.ctx.factory.create('user', {
    first_name: 'James', last_name: 'Member'
  })

  await t.ctx.factory.create('membership', { team, user: teamMember, role: 'member' })

  await t.navigateTo('/datasets')
  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()
  await dataTab.selectImage(0)
  await dataTab.createTaskFromSelection()

  await t
    .click(dataTab.newTaskPopover.assigneeOption.withText('Joe Owner'))

  await datasetManagementPage.goToTasks()

  await t
    .expect(tasksTab.tasks.count).eql(1)
    .expect(tasksTab.tasks.nth(0).textContent).contains('JO')

  await tasksTab.changeAssignee(0)
  await t
    .click(tasksTab.assignTaskModal.assigneeDropdown)
    .click(tasksTab.assignTaskModal.assigneeDropdownOptions.withText('James Member'))
    .click(tasksTab.assignTaskModal.assignTaskButton)
    .expect(tasksTab.tasks.nth(0).textContent).contains('JM')

  await tasksTab.archiveTask(0)

  await t.expect(tasksTab.tasks.count).eql(0)
})

test('task select/shift-select/escape/multiple-select', async t => {
  const { dataset } = t.ctx.data

  await t.ctx.factory.createList('task', 5, { dataset })

  await t.navigateTo('/datasets')
  await datasetsPage.openDataset(0)
  await datasetPage.goToDatasetManagement()
  await datasetManagementPage.goToTasks()

  await t.expect(tasksTab.tasks.count).eql(5)

  await tasksTab.selectTask(0)
  await t.expect(tasksTab.checkedTasks.count).eql(1)

  await tasksTab.shiftSelectTask(2)
  await t.expect(tasksTab.checkedTasks.count).eql(3)

  await t.pressKey('esc')
  await t.expect(tasksTab.checkedTasks.count).eql(0)

  await tasksTab.selectTask(2)
  await t.expect(tasksTab.checkedTasks.count).eql(1)
})

// This tests keeps failing on Jenkins but we cannot reproduce locally
test('class creation and editing', async t => {
  const classesPage = new ClassesModel()
  await t.navigateTo('/datasets')

  await datasetsPage.openDataset(0)
  await datasetPage.goToClasses()

  await t
    // check existing classes are rendered correctly
    .expect(classesPage.classes.withText('Flask').exists).ok()
    .expect(classesPage.classes.count).eql(2)
    // start class creation
    .click(classesPage.newClassButton)
    .expect(classesPage.dialog.saveButton.withAttribute('disabled').exists).ok()
    // fill out info
    .typeText(classesPage.dialog.nameField, 'Test class')
    .click(classesPage.dialog.annotationTypes.boundingBox)
    .typeText(classesPage.dialog.descriptionField, 'Test class description')
    // submit dialog
    .click(classesPage.dialog.saveButton)
    .expect(classesPage.classes.count).eql(3)
    .expect(classesPage.classes.withText('Test class').exists).ok()

  await classesPage.editClass('Test class')
  await t
    .typeText(classesPage.dialog.nameField, 'Test class 2', { replace: true })
    .click(classesPage.dialog.saveButton)
    .expect(classesPage.classes.withText('Test class 2').exists).ok()
    .expect(classesPage.classes.count).eql(3)
})
