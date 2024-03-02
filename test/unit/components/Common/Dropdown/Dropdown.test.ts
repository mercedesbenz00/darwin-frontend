import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import Dropdown from '@/components/Common/Dropdown/Dropdown.vue'

const localVue = createLocalVue()

const VSelect = {
  props: ['options'],
  template: `
    <div class="v-select">
      <slot name="header" />
      <slot name="footer" />
      <slot name="list-header" />
      <slot name="list-footer" />

      <slot name="no-options" search="search" searching="searching" :loading="false" />
      <slot name="open-indicator" :attributes="{ ref: 'ref' }" />
      <ul class="vs__dropdown-menu">
        <li v-for="(option, index) of options" :key="index">
          <slot name="option" v-bind="option" />
        </li>
      </ul>
      <slot name="search" attributes="attributes" events="events" />
      <template v-if="options.length > 0">
        <slot name="selected-option" v-bind="options[0]" />
        <slot
          name="selected-option-conainer"
          :option="options[0]"
          deselect="deselect"
          multiple="multiple"
          disabled="disabled"
        />
      </template>
      <slot name="spinner" :loading="false" />
    </div>
  `
}

let propsData: {
  dropdownClassName: string
  options: (string | object)[]
}
const stubs: Stubs = { VSelect }

beforeEach(() => {
  propsData = {
    dropdownClassName: 'my-dropdown',
    options: [
      { id: 1, label: 'option 1' },
      { id: 2, label: 'option 2' }
    ]
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Dropdown, { localVue, propsData, scopedSlots: {}, slots: {}, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should render div.dropdown__arrow when there is no open-indicator slot', () => {
  const wrapper = shallowMount(Dropdown, { localVue, propsData, scopedSlots: {}, slots: {}, stubs })
  expect(wrapper.find('span.dropdown__arrow').exists()).toBeTruthy()
})

it('renders all the slots properly', () => {
  const slots = {
    header: 'header slot',
    footer: 'footer slot',
    'list-header': 'list-header slot',
    'list-footer': 'list-footer slot'
  }
  const scopedSlots = {
    'no-options': '<div class="no-options-stub" slot-scope="ctx">{{ ctx }}</div>',
    'open-indicator': '<div class="open-indicator-stub" slot-scope="ctx">{{ ctx }}</div>',
    option: '<div class="option-stub" slot-scope="ctx">{{ ctx }}</div>',
    search: '<div class="search-stub" slot-scope="ctx">{{ ctx }}</div>',
    'selected-option': '<div class="selected-option-stub" slot-scope="ctx">{{ ctx }}</div>',
    'selected-option-conainer': '<div class="selected-option-conainer-stub" slot-scope="ctx">{{ ctx }}</div>',
    spinner: '<div class="spinner-stub" slot-scope="ctx">{{ ctx }}</div>'
  }
  const wrapper = shallowMount(Dropdown, { localVue, propsData, scopedSlots, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})
