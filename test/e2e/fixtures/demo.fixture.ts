import 'testcafe'

import WorkviewModel from '../models/workview.model'
import { initSandbox, checkinSandbox } from '../utils/sandbox'
import config from '../config'
import { stripeStub } from '../utils/helpers'

fixture('Demo pages')
  .page(config.baseUrl)
  .beforeEach(async t => initSandbox(t))
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

const workviewPage = new WorkviewModel()

test('Tutorial page loads', async t => {
  await t
    .navigateTo('/tutorial')
    .expect(workviewPage.bottomBarImages.count).eql(11)
})
