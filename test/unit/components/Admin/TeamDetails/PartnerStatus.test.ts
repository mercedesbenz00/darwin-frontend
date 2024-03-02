import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import PartnerStatus from '@/components/Admin/TeamDetails/PartnerStatus.vue'
import TeamSection from '@/components/Admin/TeamDetails/TeamSection.vue'
import TeamSectionField from '@/components/Admin/TeamDetails/TeamSectionField.vue'
import { installCommonComponents } from '@/plugins/components'
import { TeamPayload } from '@/store/modules/admin/types'

const localVue = createLocalVue()
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

let team: TeamPayload
let propsData: {
  team: TeamPayload
}

const stubs = { TeamSection, TeamSectionField }

class ComponentModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get makePartnerButton () {
    return this.wrapper.find('primary-button-stub')
  }

  get makePartnerButtonIsDisabled (): boolean {
    return this.makePartnerButton.attributes('disabled') === 'true'
  }

  clickMakePartnerButton () {
    return this.makePartnerButton.vm.$emit('click')
  }

  get makePartnerConfirmationDialog () {
    return this.wrapper.find('confirmation-dialog-stub')
  }

  confirmMakePartner () {
    return this.makePartnerConfirmationDialog.vm.$emit('confirmed')
  }
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(PartnerStatus, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when partner', () => {
  beforeEach(() => {
    team = buildAdminTeamPayload({ name: 'V7', managed_status: 'partner' })
    propsData = { team }
  })

  itMatchesSnapshot()

  it('indicates team is partner', () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, stubs })
    expect(wrapper.text()).toContain('partner')
  })
})

describe('when regular', () => {
  let mocks: {
    $modal: { show: jest.Mock }
  }

  beforeEach(() => {
    localVue.use(Vuex)

    team = buildAdminTeamPayload({ name: 'V7', managed_status: 'regular' })
    propsData = { team }

    mocks = {
      $modal: { show: jest.fn() }
    }

    store = createTestStore()
  })

  itMatchesSnapshot()

  it('shows confirmation when trying to convert to partner', async () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, mocks, stubs })
    const component = new ComponentModel(wrapper)

    await component.clickMakePartnerButton()
    expect(mocks.$modal.show).toHaveBeenCalledWith('convert-to-partner-confirmation')
  })

  it('dispatches action when confirming partner conversion', async () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, mocks, store, stubs })
    const component = new ComponentModel(wrapper)
    await component.confirmMakePartner()
    expect(store.dispatch).toHaveBeenCalledWith('admin/convertTeamToPartner', { teamId: team.id })
  })

  it('disables make partner button while performing action', async () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, mocks, store, stubs })
    const component = new ComponentModel(wrapper)
    await component.confirmMakePartner()
    expect(component.makePartnerButtonIsDisabled).toBe(true)

    await flushPromises()
    expect(component.makePartnerButtonIsDisabled).toBe(false)
  })

  it('dispatches toast on conversion error', async () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, mocks, store, stubs })
    const component = new ComponentModel(wrapper)

    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    await component.confirmMakePartner()
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it('dispatches toast on conversion validation error due to card missing', async () => {
    const wrapper = shallowMount(PartnerStatus, { localVue, propsData, mocks, store, stubs })
    const component = new ComponentModel(wrapper)

    const error = {
      isValidationError: true,
      managedStatus: "Couldn't verify payment method"
    }

    jest.spyOn(store, 'dispatch').mockResolvedValue({ error })
    await component.confirmMakePartner()
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
      content: "Couldn't convert to partner due to issue with team: Couldn't verify payment method"
    })
  })
})

describe('when client', () => {
  beforeEach(() => {
    team = buildAdminTeamPayload({ name: 'V7', managed_status: 'client' })
    propsData = { team }
  })

  itMatchesSnapshot()
})
