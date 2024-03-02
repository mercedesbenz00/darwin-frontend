<template>
  <type-icon-with-label
    class="training-class"
    :class="{'training-class--unmapped': !mapped}"
    :type="trainingClass.type"
    :label="trainingClass.name"
  />
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import { TrainingClass, ModelStageTemplatePayload } from '@/store/types'

/**
 * Used to render a single class item in the class list section on a model stage
 * template.
 *
 * Doesn't contain much logic, but is a compent of it's own so it can
 * encapsulate the "show unmapped class as disabled" UI logic.
 */
@Component({
  name: 'training-class-item',
  components: { TypeIconWithLabel }
})
export default class TrainingClassItem extends Vue {
  /**
   * The model training class who's info needs to be rendered
   */
  @Prop({ required: true, type: Object as () => TrainingClass })
  trainingClass!: TrainingClass

  /**
   * The stage template being rendered. The info within is needed to determine
   * if the training class is mapped or not.
   */
  @Prop({ required: true, type: Object as () => ModelStageTemplatePayload })
  stageTemplate!: ModelStageTemplatePayload

  get mapped (): boolean {
    const { stageTemplate, trainingClass } = this
    return (stageTemplate.metadata.class_mapping || [])
      .filter(m => !!m.annotation_class_id)
      .map(m => m.model_class_label)
      .includes(trainingClass.name)
  }
}
</script>

<style lang="scss" scoped>
.training-class.training-class--unmapped {
  opacity: 0.3;
}
</style>
