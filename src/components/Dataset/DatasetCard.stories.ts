import Vue from 'vue'

import DatasetCard from '@/components/Dataset/DatasetCard/V1/DatasetCard.vue'
import store from '@/store'
import { sfh } from '@/storybook/fixtures/datasets'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Dataset/DatasetCard',
  argTypes: {
    data: { control: 'object' },
    menuAlign: { control: { type: 'radio', options: ['normal', 'left', 'right'] } },
    disableMenu: { control: 'boolean' },
    selectable: { control: 'boolean' },
    selected: { control: 'boolean' }
  },
  parameters: {
    backgrounds: {
      default: 'White',
      values: [
        { name: 'White', value: colors.colorWhite },
        { name: 'AliceBlue', value: colors.colorAliceBlue },
        { name: 'AliceShade', value: colors.colorAliceShade },
        { name: 'AliceShadow', value: colors.colorAliceShadow }
      ]
    }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

export const Default = (args: Args, { argTypes }: any) => Vue.extend({
  components: { DatasetCard },
  props: Object.keys(argTypes),
  store,
  beforeMount () {
    store.commit('dataset/RESET_ALL')
    store.commit('dataset/PUSH_DATASET_ITEMS', [sfh])
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('auth/RESET_ALL')
  },
  data: () => ({
    sfh,
    selectedDataset: sfh
  }),
  methods: {
    onDblClick (): void {}
  },
  template: `
    <dataset-card
      :id="\`dataset-${sfh.id}\`"
      :key="sfh.id"
      class="pick-dataset__dataset-card"
      disable-menu
      selectable
      :data="sfh"
      :selected="selectedDataset === sfh"
      @click="$emit('update:selectedDataset', dataset)"
      @dblclick="onDblClick(dataset)"
    />
  `
})

Default.args = {
  data: sfh,
  menuAlign: 'normal',
  selected: false,
  selectable: false,
  disableMenu: false
}
