import { Selector, t, ClientFunction } from 'testcafe'

export default class DatasetsModel {
  datasets = Selector('.dataset-card')

  getDataset (index: number) {
    return this.datasets.nth(index)
  }

  openDataset (index: number) {
    const dataset = this.getDataset(index)
    return t
      .hover(dataset)
      .click(dataset)
  }

  /**
   * Indicates if currently on /datasets or not
   */
  isCurrent = ClientFunction(
    () => window.location.href.endsWith('/datasets') || window.location.href.endsWith('/')
  )
}
