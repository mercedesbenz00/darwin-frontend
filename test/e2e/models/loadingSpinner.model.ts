import { Selector } from 'testcafe'

export default class LoadingSpinnerModel {
  spinner: Selector
  activeSpinner: Selector

  constructor (prefix: string) {
    this.spinner = Selector(`${prefix} .v-loading`)
    this.activeSpinner = Selector(`${prefix} .v-loading.v-loading--active`)
  }

  isLoading () {
    return this.spinner.hasClass('.v-loading--active')
  }
}
