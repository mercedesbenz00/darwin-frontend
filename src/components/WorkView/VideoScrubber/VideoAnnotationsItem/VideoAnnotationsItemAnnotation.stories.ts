import { Annotation } from '@/engine/models'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import store from '@/store'
import { annotationClasses } from '@/storybook/fixtures'
import { parseRGBA } from '@/utils'

import VideoAnnotationsItemAnnotation from './VideoAnnotationsItemAnnotation.vue'

const stories = {
  component: VideoAnnotationsItemAnnotation,
  title: 'Workview/VideoScrubber/VideoAnnotationsItemAnnotation',
  argTypes: {
    annotation: { control: 'object' }
  }
}

export default stories

const annotation: Partial<Annotation> = {
  actors: [],
  annotationClass: new AnnotationClass(annotationClasses.flask),
  classId: annotationClasses.flask.id,
  label: 'Some label',
  color: parseRGBA(annotationClasses.flask.metadata._color),
  data: { frames: [] },
  id: 'fake-id-1',
  isHighlighted: false,
  isSelected: false,
  isVisible: true,
  zIndex: 1,
  type: 'polygon',
  subAnnotations: []
}

const baseArgs = {
  annotation
}

const setupStore = (vm: Vue) => {
  const store = vm.$store
  store.commit('aclass/SET_CLASSES', [...Object.values(annotationClasses)])
}

const base = {
  components: { VideoAnnotationsItemAnnotation },
  props: ['annotation'],
  template: '<video-annotations-item-annotation v-bind="$props" />',
  store,
  created () {
    setupStore(this as unknown as Vue)
  }
}

export const Normal = () => ({ ...base })
Normal.args = { ...baseArgs }
