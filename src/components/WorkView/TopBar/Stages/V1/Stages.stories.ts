import store from '@/store'
import { DatasetItemPayload } from '@/store/types'
import { workflowTemplates } from '@/storybook/fixtures'
import { sfh } from '@/storybook/fixtures/datasets'

import Stages from './Stages.vue'

export default {
  title: 'Workview/TopBar/Stages'
}

const { arc, mmlarc } = workflowTemplates

const newItem: Partial<DatasetItemPayload> = {
  id: 5,
  dataset_id: sfh.id,
  current_workflow_id: null,
  current_workflow: null
}

const arcDataset = { ...sfh, default_workflow_template_id: arc.id }
const mmlarcDataset = { ...sfh, default_workflow_template_id: mmlarc.id }

export const ARCTemplate = () => ({
  components: { Stages },
  template: '<div style="height: 44px; display: grid; align-items: center;"><stages /></div>',
  store,
  created () {
    const vm = (this as unknown as Vue)
    vm.$store.commit('workview/SET_SELECTED_DATASET_ITEM', newItem)
    vm.$store.commit('workview/SET_DATASET', arcDataset)
    vm.$store.commit('workview/PUSH_WORKFLOW_TEMPLATE', arc)
  }
})

export const MMLARCTemplate = () => ({
  components: { Stages },
  template: '<div style="height: 44px; display: grid; align-items: center;"><stages /></div>',
  store,
  created () {
    const vm = (this as unknown as Vue)
    vm.$store.commit('workview/SET_SELECTED_DATASET_ITEM', newItem)
    vm.$store.commit('workview/SET_DATASET', mmlarcDataset)
    vm.$store.commit('workview/PUSH_WORKFLOW_TEMPLATE', mmlarc)
  }
})
