<template>
  <button
    class="selectable-class"
    :class="{'selectable-class--selected': selected}"
    :disabled="!eligible"
    @click="toggleSelection"
  >
    <class-item :annotation-class="distribution.annotationClass" />
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import ClassItem from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassItem.vue'
import {
  ClassOverallDistribution,
  DistributionStatus
} from '@/components/Dataset/ClassDistribution/types'
import { isTypeEligible } from '@/store/modules/neuralModel/utils'
import { AnnotationClassPayload, AnnotationTypePayload, ModelType } from '@/store/types'

@Component({
  name: 'selectable-class',
  components: { ClassItem }
})
export default class SelectableClass extends Vue {
  @Prop({ required: true, type: Object as () => ClassOverallDistribution })
  distribution!: ClassOverallDistribution

  @State(state => state.neuralModel.newModelSelectedClassIds)
  selectedClassIds!: AnnotationClassPayload['id'][]

  @State(state => state.neuralModel.newModelType)
  type!: ModelType

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (aClass: AnnotationClassPayload) => AnnotationTypePayload

  get eligible (): boolean {
    const { distribution, type } = this

    return isTypeEligible(this.getMainAnnotationType(distribution.annotationClass).name, type) &&
       distribution.status !== DistributionStatus.VERY_LOW_DATA &&
       distribution.status !== DistributionStatus.LOW_DATA &&
       distribution.countByInstances > 0
  }

  get selected (): boolean {
    const { distribution, selectedClassIds } = this
    return selectedClassIds.includes(distribution.annotationClass.id)
  }

  toggleSelection (): void {
    const { distribution, $store } = this
    $store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', distribution.annotationClass)
  }
}
</script>

<style lang="scss" scoped>
.selectable-class {
  border: 1px solid transparent;
  border-radius: 100px;
  background-color: transparent;
  transition: background-color, border-color .2s ease;
  width: 100%;
  cursor: pointer;

}

.selectable-class:hover:not(:disabled) {
  border-color: transparent;
  background: $colorAliceShadow;
}

.selectable-class--selected {
  border-color: $colorAliceNight;
  background: $colorAliceShadow;
}

.selectable-class:disabled {
  opacity: 0.3;
}
</style>
