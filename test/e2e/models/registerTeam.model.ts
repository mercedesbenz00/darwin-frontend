import { Selector } from 'testcafe'

export default class RegisterTeamModel {
  submitButton = Selector('.register-team__modal__buttons button[type="submit"]')
  nameInput = Selector('.register-team__modal__upload__name input')
  uploadInput = Selector('.register-team__modal__upload input.upload__input')
  members = Selector('.register-team__modal__member')
  avatar = Selector('.register-team__modal__upload .upload__img')

  async getMember (index: number) {
    const memberSelector = `.register-team__modal__member:nth-child(${index + 1})`
    return {
      name: Selector(`${memberSelector} input`),
      trash: Selector(`${memberSelector} .register-team__modal__member__trash`),
      roleDropdown: Selector(`${memberSelector} .select2`),
      roleDropdownOptions: Selector('.select2-results__option')
    }
  }
}
