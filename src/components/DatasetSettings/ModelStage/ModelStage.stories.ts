import { action } from '@storybook/addon-actions'
import Modal from 'vue-js-modal'

import store from '@/store'
import { ModelStageTemplatePayload } from '@/store/types'
import { annotationClasses, runningSessions, workflowTemplates } from '@/storybook/fixtures'

import ModelStage from './ModelStage.vue'

export default {
  component: ModelStage,
  title: 'DatasetSettings/ModelStage'
}

const { boxotron, catFinder } = runningSessions
const catFinderOffline = { ...catFinder, max: 0 }

const setStore = (vm: Vue) => {
  const store = vm.$store
  store.commit('neuralModel/SET_RUNNING_SESSIONS', [boxotron, catFinderOffline])
  store.commit('dataset/SET_CURRENT_TEAM_ANNOTATION_CLASSES', Object.values(annotationClasses))
}

const defaultMethods = () => ({
  change: action('change'),
  delete: action('delete')
})

const stage = workflowTemplates.mmlarc.workflow_stage_templates[0] as ModelStageTemplatePayload

const boxotronPreselectedStage = {
  ...stage,
  metadata: {
    ...stage.metadata,
    running_session_id: boxotron.id
  }
}

const boxotronPremappedStage: ModelStageTemplatePayload = {
  ...boxotronPreselectedStage,
  metadata: {
    ...boxotronPreselectedStage.metadata,
    class_mapping: boxotron.meta.classes.map(c => ({
      annotation_class_id: annotationClasses.bottle.id,
      model_class_label: c.name
    }))
  }
}

export const Premapped = () => ({
  components: { Modal, ModelStage },
  data: () => ({ stage: boxotronPremappedStage }),
  store,
  mounted () {
    setStore(this as unknown as Vue)
  },
  template: '<model-stage deletable :stage="stage" @change="change" />',
  methods: defaultMethods()
})

export const Cleared = () => ({
  components: { Modal, ModelStage },
  data: () => ({ stage }),
  store,
  mounted () {
    setStore(this as unknown as Vue)
  },
  template: '<model-stage deletable :stage="stage" @change="change" />',
  methods: defaultMethods()
})

export const Preselected = () => ({
  components: { Modal, ModelStage },
  data: () => ({ stage: boxotronPreselectedStage }),
  store,
  mounted () {
    setStore(this as unknown as Vue)
  },
  template: '<model-stage deletable :stage="stage" @change="change" />',
  methods: defaultMethods()
})

export const FirstInWorkflow = () => ({
  components: { Modal, ModelStage },
  data: () => ({ stage: { ...boxotronPreselectedStage, stage_number: 1 } }),
  store,
  mounted () {
    setStore(this as unknown as Vue)
  },
  template: '<model-stage deletable :stage="stage" @change="change" />',
  methods: defaultMethods()
})
