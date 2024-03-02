import { action } from '@storybook/addon-actions'

import store from '@/store'
import { FeaturePayload } from '@/store/types'
import { workflowTemplates } from '@/storybook/fixtures'

import NewStage from './NewStage.vue'

export default {
  title: 'DatasetSettings/NewStage'
}

const codeStageFeature: FeaturePayload = { name: 'CODE_STAGE', enabled: true }
const modelStageFeature: FeaturePayload = { name: 'MODEL_STAGE', enabled: true }

export const Normal = () => ({
  components: { NewStage },
  data: () => ({ template: workflowTemplates.arc }),
  template: '<new-stage :template="template" @create="onCreate"/>',
  store,
  mounted () {
    const vm = this as unknown as Vue
    const store = vm.$store
    store.commit('features/SET_FEATURES', [])
  },
  methods: {
    onCreate: action('create')
  }
})

export const CodeEnabled = () => ({
  components: { NewStage },
  data: () => ({ template: workflowTemplates.mmlarc }),
  template: '<new-stage :template="template" @create="onCreate"/>',
  store,
  mounted () {
    const vm = this as unknown as Vue
    const store = vm.$store
    store.commit('features/SET_FEATURES', [codeStageFeature])
  },
  methods: {
    onCreate: action('create')
  }
})

export const ModelsEnabled = () => ({
  components: { NewStage },
  data: () => ({ template: workflowTemplates.mmlarc }),
  template: '<new-stage :template="template" @create="onCreate"/>',
  store,
  mounted () {
    const vm = this as unknown as Vue
    const store = vm.$store
    store.commit('features/SET_FEATURES', [modelStageFeature])
  },
  methods: {
    onCreate: action('create')
  }
})

export const CodeAndModelsEnabled = () => ({
  components: { NewStage },
  data: () => ({ template: workflowTemplates.mmlarc }),
  template: '<new-stage :template="template" @create="onCreate"/>',
  store,
  mounted () {
    const vm = this as unknown as Vue
    const store = vm.$store
    store.commit('features/SET_FEATURES', [
      codeStageFeature,
      modelStageFeature
    ])
  },
  methods: {
    onCreate: action('create')
  }
})
