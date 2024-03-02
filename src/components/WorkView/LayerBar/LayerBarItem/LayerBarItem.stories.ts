import store from '@/store'
import { StageAnnotation } from '@/store/modules/workview/types'
import { annotationClasses } from '@/storybook/fixtures'

import LayerBarItem from './LayerBarItem.vue'

const Sidebar = () => {
  return {
    template: '<div style="width: 300px;"><story/></div>'
  }
}

const stories = {
  title: 'Workview/LayerBar/LayerBarItem',
  decorators: [Sidebar],
  argTypes: {
    annotation: { control: 'object' },
    readonly: { control: 'boolean' }
  }
}

export default stories

const annotation: StageAnnotation = {
  actors: [],
  annotation_class_id: annotationClasses.flask.id,
  annotation_group_id: null,
  data: {},
  id: 'fake-id-1',
  isHighlighted: false,
  isSelected: false,
  isVisible: true,
  workflow_stage_id: -1,
  z_index: 1
}

const setupStore = (vm: Vue): void => {
  const store = vm.$store
  store.commit('aclass/SET_CLASSES', [...Object.values(annotationClasses)])
}

const base = {
  components: { LayerBarItem },
  props: ['annotation', 'isRemovable'],
  template: '<layer-bar-item v-bind="$props" />',
  store,
  created (): void {
    setupStore(this as unknown as Vue)
  }
}

export const Normal = () => ({ ...base })
Normal.args = { annotation }

export const Selected = () => ({ ...base })
Selected.args = { annotation: { ...annotation, isSelected: true } }

export const Highlighted = () => ({ ...base })
Highlighted.args = { annotation: { ...annotation, isHighlighted: true } }

export const Hidden = () => ({ ...base })
Hidden.args = { annotation: { ...annotation, isVisible: false } }
