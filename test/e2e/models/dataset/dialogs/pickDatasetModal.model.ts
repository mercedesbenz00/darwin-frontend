import { Selector } from 'testcafe'

export default class PickDatasetModal {
  modal = Selector('.pick-dataset-modal')
  pickableDataset = Selector('.pick-dataset-modal .modal__content .datasets .dataset')
  selectButton = Selector('.pick-dataset-modal .modal__footer button:not(.button--secondary)')
}
