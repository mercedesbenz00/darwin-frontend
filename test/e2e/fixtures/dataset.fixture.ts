import 'testcafe'

import config from '../config'
import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory } from '../utils/factory'
import { clientLogin, stripeStub } from '../utils/helpers'
import DatasetsOverviewModel from '../models/dataset/overview.model'
import DatasetCreateModel from '../models/dataset/datasetCreate.model'
import PickDatasetModal from '../models/dataset/dialogs/pickDatasetModal.model'
import DropzoneModel from '../models/dataset/dropzone.model'
import DatasetManagementModel from '../models/dataset/datasetManagement.model'

fixture('Dataset creation')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)

    const user = await t.ctx.factory.create('user', { email: 'joe@v7labs.com', password: 'Password1' })
    const team = await t.ctx.factory.create('team')
    await t.ctx.factory.create('customer', { team })
    await t.ctx.factory.create('membership', { user, team, role: 'owner' })

    t.ctx.data = { user, team }

    await clientLogin(t, 'joe@v7labs.com', 'Password1')
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('dataset creation with new data', async t => {
  await t.navigateTo(`${config.baseUrl}/datasets`)

  const datasetOverviewPage = new DatasetsOverviewModel()
  const datasetCreatePage = new DatasetCreateModel()
  const dropzoneModel = new DropzoneModel()
  const datasetManagementPage = new DatasetManagementModel()

  await t
    .click(datasetOverviewPage.createCard)
    .expect(datasetCreatePage.isCreateStep()).ok

  // Step 1: enter dataset name
  await t
    .typeText(datasetCreatePage.titleStep.titleInput, 'Test Dataset')
    .click(datasetCreatePage.titleStep.continueButton)
    .expect(datasetCreatePage.isDataStep()).ok()

  // Step 2: upload dataset images

  await dropzoneModel.dragDropFiles([
    '../../assets/test1.png',
    '../../assets/test2.png',
    '../../assets/test3.png',
    '../../assets/video.mp4'
  ])

  await t
    .click(datasetCreatePage.videoModal.submitButton)
    .click(datasetCreatePage.dataStep.continueButton)
    .expect(datasetCreatePage.isInstructionsStep()).ok()

  // Step 3: add instructions
  await t.expect(datasetCreatePage.instructionsStep.editorContent.exists).ok({ timeout: 20000 })

  await t
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'NormalTest')
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.boldButton)
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'Instructions')
    .click(datasetCreatePage.instructionsStep.editorToolbar.boldButton)
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.italicButton)
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'ItalicTest')
    .click(datasetCreatePage.instructionsStep.editorToolbar.italicButton)
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.underlineButton)
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'UnderlineTest')
    .click(datasetCreatePage.instructionsStep.editorToolbar.underlineButton)
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.orderedlistButton)
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'order1')
    .pressKey('enter')
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'order2')
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.orderedlistButton)
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'item1')
    .click(datasetCreatePage.instructionsStep.editorToolbar.unorderedlistButton)
    .pressKey('enter')
    .typeText(datasetCreatePage.instructionsStep.editorContent, 'item2')
    .pressKey('enter')
    .click(datasetCreatePage.instructionsStep.editorToolbar.unorderedlistButton)
    .click(datasetCreatePage.instructionsStep.editorToolbar.imageButton)
    .setFilesToUpload(datasetCreatePage.instructionsStep.imageUploadArea, '../../assets/avatar.png')

  await t
    .expect(datasetCreatePage.instructionsStep.editorContent.textContent).contains('NormalTest')
    .expect(datasetCreatePage.instructionsStep.editorContent.find('strong').textContent).contains('Instructions')
    .expect(datasetCreatePage.instructionsStep.editorContent.find('em').textContent).contains('ItalicTest')
    .expect(datasetCreatePage.instructionsStep.editorContent.find('u').textContent).contains('UnderlineTest')
    .expect(datasetCreatePage.instructionsStep.editorContent.textContent).contains('order1')
    .expect(datasetCreatePage.instructionsStep.editorContent.textContent).contains('order2')
    .expect(datasetCreatePage.instructionsStep.editorContent.textContent).contains('item1')
    .expect(datasetCreatePage.instructionsStep.editorContent.textContent).contains('item2')
    .expect(datasetCreatePage.instructionsStep.editorContent.find('img').exists).ok()

  // Add test for creating a new annotation class dialog
  await t
    .click(datasetCreatePage.instructionsStep.continueButton)
    .expect(datasetCreatePage.isAnnotatorsStep()).ok()

  // Step 4: add dataset settings

  await t
    .click(datasetCreatePage.settingsStep.continueButton)
    .expect(datasetManagementPage.isCurrent()).ok()
    .expect(datasetManagementPage.dataTab.cards.count).eql(4, { timeout: 10000 })
    .expect(datasetManagementPage.dataTab.images.count).eql(3)
    .expect(datasetManagementPage.dataTab.videos.count).eql(1)
  // check video subroute
  await datasetManagementPage.dataTab.openVideo(0)
  await t
    .expect(datasetManagementPage.dataTab.images.count).eql(7, { timeout: 8000 })
})

test('dataset creation from existing dataset', async t => {
  const { team } = t.ctx.data
  await t.ctx.factory.seed(team, 1)
  await t.navigateTo(`${config.baseUrl}/datasets`)

  const datasetOverviewPage = new DatasetsOverviewModel()
  const datasetCreatePage = new DatasetCreateModel()
  const pickDatasetModal = new PickDatasetModal()
  const datasetManagementPage = new DatasetManagementModel()

  await t
    .click(datasetOverviewPage.createCard)
    .expect(datasetCreatePage.isCreateStep()).ok()

  // Step 1: enter dataset name
  await t
    .typeText(datasetCreatePage.titleStep.titleInput, 'Test Dataset')
    .click(datasetCreatePage.titleStep.continueButton)
    .expect(datasetCreatePage.isDataStep()).ok()

  // Step 2: upload dataset images
  await t
    .click(datasetCreatePage.dataStep.pickButton)
    .click(pickDatasetModal.pickableDataset.nth(0))
    .click(pickDatasetModal.selectButton)
    .expect(datasetCreatePage.dataStep.imageZone.exists).ok()
    .expect(datasetCreatePage.dataStep.imageZoneFile.nth(0).exists).ok()
    .click(datasetCreatePage.dataStep.continueButton)
    .expect(datasetCreatePage.isInstructionsStep()).ok()

  // Step 3: skip instructions
  await t
    .click(datasetCreatePage.instructionsStep.continueButton)
    .expect(datasetCreatePage.isAnnotatorsStep()).ok()

  // Step 4: add dataset settings
  await t
    .click(datasetCreatePage.settingsStep.continueButton)

  await t
    .expect(datasetManagementPage.isCurrent()).ok()
    .expect(datasetManagementPage.dataTab.images.count).eql(1, { timeout: 5000 })
})
