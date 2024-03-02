import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import { ModelStageTemplatePayload, WorkflowStageTemplatePayload } from '@/store/types'
import { slider } from '@/storybook/controls/slider'
import { workflowTemplates } from '@/storybook/fixtures'
import { flask, scale, textBox, textField } from '@/storybook/fixtures/annotationClasses'
import { boxotron, ocr } from '@/storybook/fixtures/runningSessions'

import ClassMapping from './ClassMapping.vue'

const stories = {
  component: ClassMapping,
  title: 'DatasetSettings/ModelStage/ClassMapping',
  argTypes: {
    annotationClasses: { control: 'object' },
    runningSession: { control: 'object' },
    stage: { control: 'object' },
    stageMapping: { control: 'array' },
    cancel: { action: 'cancel' },
    confirm: { action: 'confirm' },
    width: slider(500, 900),
    height: slider(400, 800)
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>
type StoryConfig = { argTypes: typeof stories.argTypes }

const buildActions = () => ({
  cancel: action('cancel'),
  confirm: action('confirm')
})

export const Normal = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { ClassMapping },
  props: Object.keys(argTypes),
  data () {
    return { actions: buildActions() }
  },
  computed: {
    style: {
      get (): Record<string, string> {
        const { width, height } = this
        return {
          width: `${width}px`,
          height: `${height}px`
        }
      }
    }
  },
  template: `
    <div :style="style">
      <class-mapping v-bind="$props" v-on="actions" />
    </div>
  `
})

const scaleWithLongName = { ...scale, id: 55, name: 'Scale with extremely long name' }
const scaleWithLongWord = { ...scale, id: 66, name: 'ScaleWithOneExtremelyLongWordAsName' }

Normal.args = {
  annotationClasses: [flask, scale, scaleWithLongName, scaleWithLongWord],
  runningSession: boxotron,
  stage: workflowTemplates.mmlarc.workflow_stage_templates[0],
  stageMapping: [],
  width: 500,
  height: 400
}

export const WithSubsAndErrors = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { ClassMapping },
  props: Object.keys(argTypes),
  data () { return { actions: buildActions() } },
  computed: {
    style: {
      get (): Record<string, string> {
        const { width, height } = this
        return {
          width: `${width}px`,
          height: `${height}px`
        }
      }
    }
  },
  template: `
    <div :style="style">
      <class-mapping v-bind="$props" v-on="actions" />
    </div>
  `
})

const { mmlarc } = workflowTemplates

const mmlarcModel1 = mmlarc.workflow_stage_templates[0] as ModelStageTemplatePayload

const ocrStage: WorkflowStageTemplatePayload = {
  ...mmlarcModel1,
  metadata: {
    ...mmlarcModel1.metadata,
    class_mapping: [
      { model_class_label: ocr.meta.classes[0].name, annotation_class_id: textBox.id },
      { model_class_label: ocr.meta.classes[1].name, annotation_class_id: textBox.id },
      { model_class_label: ocr.meta.classes[2].name, annotation_class_id: textField.id }
    ]
  }
}

WithSubsAndErrors.args = {
  annotationClasses: [flask, scale, textBox, textField],
  runningSession: ocr,
  stage: ocrStage,
  stageMapping: ocrStage.metadata.class_mapping,
  width: 500,
  height: 400
}
