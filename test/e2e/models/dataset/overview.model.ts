import { Selector } from 'testcafe'

export default class DatasetOverviewModel {
  cards = Selector('.dataset-card')
  createCard = Selector('.button.dataset-overview__button')
}
