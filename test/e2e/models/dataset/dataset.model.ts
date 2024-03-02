import { Selector, t } from 'testcafe'

export default class DatasetModel {
  tabs = Selector('.tabs__tab')

  goToDatasetManagement = () => t.click(this.tabs.withText('Data'))
  goToClasses = () => t.click(this.tabs.withText('Classes'))
}
