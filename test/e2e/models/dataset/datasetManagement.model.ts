import { Selector, t, ClientFunction } from 'testcafe'

import DataTabModel from './datasetManagement/dataTab.model'

export default class DatasetManagementModel {
  tabs = Selector('.dataset-management__header__tab')
  addToDatasetButton = Selector('.data-sidebar__content button.data-tab-upload__button')
  uploadStatus = Selector('.upload-progress-status')

  dataTab = new DataTabModel()

  isCurrent = ClientFunction(
    () => window.location.href.includes('/dataset-management/data')
  )

  goToData = () => t.click(this.tabs.withText('Data'))
}
