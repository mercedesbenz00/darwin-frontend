import 'testcafe'

import DatasetManagementModel from '../models/dataset/datasetManagement.model'
import ModalModel from '../models/modal.model'
import WorkviewModel from '../models/workview.model'
import LoadingSpinnerModel from '../models/loadingSpinner.model'

import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory, FactoryRecord } from '../utils/factory'
import { uiLogin, stripeStub, refreshPage } from '../utils/helpers'
import DatasetsModel from '../models/datasets.model'

const datasetManagementPage = new DatasetManagementModel()
const { dataTab, tasksTab, reviewTab } = datasetManagementPage

const datasetsPage = new DatasetsModel()
const loadingSpinner = new LoadingSpinnerModel('.workview__center__main__area')
const modalComponent = new ModalModel()

const workviewPage = new WorkviewModel()
const { classModal, toolBar, layerBar, topBar, instructionsSidebar } = workviewPage

let factory: ReturnType<typeof createFactory>
let team: FactoryRecord
let teamOwner: FactoryRecord
let data: {
  dataset: FactoryRecord
  datasetImages: FactoryRecord[]
}

fixture('Workview')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    factory = await createFactory(sandboxId)

    const user = await factory.create('user', { email: 'joe@v7labs.com', password: 'Password1' })
    teamOwner = user

    team = await factory.create('team')
    await factory.create('customer', { team })
    await factory.create('membership', { user, team, role: 'owner' })

    const { dataset, datasetImages } = await factory.seed(team)
    data = { dataset, datasetImages }
    return t
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('add and remove annotations from image', async t => {
  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  await t.click(toolBar.boundingBox)

  await workviewPage.drawBox(10, 10, 20, 20)

  // on first annotation, class modal will appear to select class

  await t
    .click(classModal.classes.nth(0))
    .click(classModal.saveButton)
    .expect(layerBar.classes.count).eql(1)

  await workviewPage.drawBox(100, 100, 200, 200)

  // on subsequent annotations, class modal no longer appears since class is preselected

  await t
    .expect(layerBar.classes.count).eql(2)
    .click(toolBar.polygon)
  await workviewPage.drawPolygon([30, 10], [130, 110], [155, 200], [30, 200], [30, 10])

  await t
    .click(classModal.classes.nth(0))
    .click(classModal.saveButton)
    .expect(layerBar.classes.count).eql(3)

  await workviewPage.drawPolygon([230, 210], [360, 315], [355, 400], [230, 400], [230, 210])
  // classModal does not show as previous polygon class is set as pre-selected class

  await t
    .expect(layerBar.classes.count).eql(4)
    // draw another bounding box
    .click(toolBar.boundingBox)
  await workviewPage.drawBox(40, 40, 50, 50)

  await t.expect(layerBar.classes.count).eql(5)

  // reload to check if classes persist
  await refreshPage()

  await t
    .expect(layerBar.classes.count).eql(5)
    // test deletion from canvas
    .click(workviewPage.canvas, { offsetX: 30, offsetY: 10 })
    .pressKey('backspace')
    .expect(layerBar.classes.count).eql(4)
    // test deletion from layer bar
    .click(layerBar.classes.nth(0))
    .pressKey('backspace')
    .expect(layerBar.classes.count).eql(3)

  // test deletion persistence
  // reload to check if classes persist
  await refreshPage()

  await t.expect(layerBar.classes.count).eql(3)
})

test('add and remove tags from image', async t => {
  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  const { tagApplier } = workviewPage

  await t
    .typeText(tagApplier.input, 'tag 1', { replace: true })
    .pressKey('enter')
    .expect(tagApplier.appliedTags.count).eql(1)
    .expect(tagApplier.availableTags.count).eql(0)
    .typeText(tagApplier.input, 'tag 2', { replace: true })
    .click(tagApplier.createButton)
    .expect(tagApplier.appliedTags.count).eql(2)
    .expect(tagApplier.availableTags.count).eql(0)
    .click(tagApplier.appliedTagRemoveButtons.nth(0))
    .expect(tagApplier.appliedTags.count).eql(1)
    .expect(tagApplier.availableTags.count).eql(1)
    .click(tagApplier.availableTags.nth(0))
    .expect(tagApplier.appliedTags.count).eql(2)
    .expect(tagApplier.availableTags.count).eql(0)

  // check if tags are persisted after refresh
  await refreshPage()

  await t
    .expect(tagApplier.appliedTags.count).eql(2)
    .expect(tagApplier.availableTags.count).eql(0)
})

test('fully annotate and submit task', async t => {
  const { dataset, datasetImages } = data
  const task = await factory.create('task', { dataset, status: 'open', user: teamOwner })

  await Promise.all([
    factory.create('dataset_image_task_status', { task, dataset_image: datasetImages[0], annotation_status: 'open' }),
    factory.create('dataset_image_task_status', { task, dataset_image: datasetImages[1], annotation_status: 'open' }),
    factory.create('dataset_image_task_status', { task, dataset_image: datasetImages[2], annotation_status: 'open' })
  ])

  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setViewedInstructions(dataset.id)
  await datasetsPage.openDataset(0)
  await datasetManagementPage.goToTasks()
  await tasksTab.openTask(0)

  await t
    .click(toolBar.boundingBox)
    .expect(loadingSpinner.activeSpinner.exists).notOk({ timeout: 30000 })

  await workviewPage.drawBox(10, 10, 20, 20)

  await t
    // select class from modal
    .click(classModal.classes.nth(0))
    .click(classModal.saveButton)
    // skip image 2
    .click(workviewPage.bottomBarImages.nth(1))
    .click(topBar.skipButton)
    .click(topBar.skipOptions.withText('Motion Blur'))
    // skip image 3
    .click(workviewPage.bottomBarImages.nth(2))
    .click(topBar.skipButton)
    .click(topBar.skipOptions.withText('Occluded'))
    // complete task
    .click(topBar.completeTaskButton)

  // check if task is in review tab
  await datasetManagementPage.goToReview()
  await t.expect(reviewTab.tasks.count).eql(1)
})

test('click on percentage to reset zoom', async t => {
  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  await t
    .click(toolBar.zoom)
    .expect(toolBar.scale.textContent).contains('%')
    .click(toolBar.scale)
    .expect(toolBar.scale.textContent).contains('%')
})

test('Instructions', async t => {
  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setNotViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  // sidebar instructions
  await t
    .expect(modalComponent.open.exists).ok()
    .click(modalComponent.closeButton)
    .expect(modalComponent.open.exists).notOk()
    .expect(instructionsSidebar.open.exists).notOk()
    .click(instructionsSidebar.openButton)
    .expect(instructionsSidebar.open.exists).ok()
    .click(instructionsSidebar.closeButton)
    .expect(instructionsSidebar.open.exists).notOk()

  // full instructions
  await t
    .click(instructionsSidebar.openButton)
    .expect(instructionsSidebar.open.exists).ok()
    .click(instructionsSidebar.fullInstructionsButton)
    .expect(instructionsSidebar.open.exists).ok()
    .expect(modalComponent.open.exists).ok()
})

test('Paginate', async t => {
  await uiLogin(t, 'joe@v7labs.com', 'Password1')
  await workviewPage.setViewedInstructions(data.dataset.id)
  await datasetsPage.openDataset(0)
  await dataTab.openImage(0)

  const { datasetImages } = data
  // seq fields is randomly generated by backend. tob bar pagination and bottom bare rendered indices render seq
  const seqList = datasetImages.map((d: any) => d.seq.toString())

  // using buttons
  await t
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[0])
    .expect(topBar.paginationInput.value).eql('1')
    .click(topBar.paginationButtonNext)
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[1])
    .expect(topBar.paginationInput.value).eql('2')
    .click(topBar.paginationButtonNext)
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[2])
    .expect(topBar.paginationInput.value).eql('3')
    .click(topBar.paginationButtonPrev)
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[1])
    .expect(topBar.paginationInput.value).eql('2')
    .click(topBar.paginationButtonPrev)

  // using input field
  await t
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[0])
    .expect(topBar.paginationInput.value).eql('1')
    .selectText(topBar.paginationInput)
    .typeText(topBar.paginationInput, '4')
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[3])
    .expect(topBar.paginationInput.value).eql('4')
    .selectText(topBar.paginationInput)
    .typeText(topBar.paginationInput, '1')

  // using carousel
  await t
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[0])
    .expect(topBar.paginationInput.value).eql('1')
    .click(workviewPage.bottomBarImages.nth(0))
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[0])
    .expect(topBar.paginationInput.value).eql('1')
    .click(workviewPage.bottomBarImages.nth(1))
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[1])
    .expect(topBar.paginationInput.value).eql('2')
    .click(workviewPage.bottomBarImages.nth(0))
    .expect(workviewPage.bottomBarSelectedImage.textContent).contains(seqList[0])
    .expect(topBar.paginationInput.value).eql('1')
})
