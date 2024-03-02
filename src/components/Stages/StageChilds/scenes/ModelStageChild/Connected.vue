<template>
  <div class="connected-model-stage-child">
    <div>
      <input-field
        readonly
        :value="modelName"
      />
    </div>
    <badge
      v-if="lenMappedToNothing > 0"
      :label="unmappedMessage"
      :color="{ r: 220, g: 24, b: 24, a: 1 }"
      :alpha="0.08"
      size="medium"
      class="connected-model-stage-child__classes_message"
    >
      <template #prefix-icon>
        <icon-duotone-warn />
      </template>
    </badge>
    <ul class="connected-model-stage-child__classes">
      <li
        class="connected-model-stage-child__class"
        v-for="mapping in mappings"
        :key="mapping.class.id"
      >
        <annotation-class-icon
          class="connected-model-stage-child__class__icon"
          :klass="mapping.annotationClass"
        />
        <div class="connected-model-stage-child__class__name">
          {{ mapping.class.name }}
        </div>
        <div
          class="connected-model-stage-child__class__mapped"
          v-if="!mapping.annotationClass"
        >
          Unmapped
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconDuotoneWarn } from '@/assets/icons/V2/Duotone'
import AnnotationClassIcon from '@/assets/icons/V2/Duotone/AnnotationClassIcon.vue'
import { Badge } from '@/components/Common/Badge'
import { InputField } from '@/components/Common/InputField/V2'
import {
  AnnotationClassPayload,
  RootState,
  RunningSessionPayload,
  TrainingClass,
  V2ModelStagePayload
} from '@/store/types'
import { pluralize } from '@/utils/pluralize'

type Mapping = {
  annotationClass: AnnotationClassPayload | null
  class: TrainingClass | null
}

@Component({
  name: 'connected-model-stage-child',
  components: { AnnotationClassIcon, Badge, IconDuotoneWarn, InputField }
})
export default class ConnectedModelStageChild extends Vue {
  @State((state: RootState) => state.neuralModel.runningSessions)
  readonly models!: RunningSessionPayload[]

  @State((state: RootState) => state.aclass.classes)
  readonly annotationClasses!: AnnotationClassPayload[]

  @Prop({ required: true, type: Object as () => V2ModelStagePayload })
  readonly stage!: V2ModelStagePayload

  get lenMappedToNothing (): number {
    return this.mappings.filter(mapping => !mapping.annotationClass).length
  }

  get unmappedMessage (): string {
    const len = this.lenMappedToNothing
    const classesLabel = pluralize(len, 'class', 'classes', true)
    const verb = pluralize(len, 'is', 'are', false)

    return `${classesLabel} ${verb} mapped to nothing!`
  }

  get mappings (): Mapping[] {
    return this.modelClasses.concat().sort((l, r) => l.name < r.name ? -1 : 1).map(klass => {
      const mapping =
        this.stage.config.class_mapping.find(m => m.model_class_label === klass.name) || null

      const annotationClass =
        this.annotationClasses.find(ac => mapping?.annotation_class_id === ac.id) || null

      return {
        annotationClass: annotationClass,
        class: klass
      }
    })
  }

  get model (): RunningSessionPayload {
    return this.models.find(({ id }) => id === this.modelId)!
  }

  get modelClasses (): TrainingClass[] {
    return this.model.meta.classes
  }

  get modelName (): string {
    return this.model.name
  }

  get modelId (): string {
    return this.stage.config.model_id
  }
}
</script>

<style lang="scss" scoped>
.connected-model-stage-child {
  padding: 8px;
  font-family: $fontFamilyInter;
  font-weight: 500;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  &__class__mapped {
    color: $colorGrayLite;
  }

  &__classes {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__classes_message {
    font-size: 1rem;
    position: relative;
  }

  &__classes_message:deep(span) {
    text-transform: none;
    width: 100%;
    padding: 0.5rem;
    height: 2.2rem;
  }

  &__classes_message:deep(svg) {
    position: absolute;
    left: 5px;
  }

  &__classes_message:deep(.badge__content__label) {
    font-size: 0.82rem !important;
    position: relative;
    margin-right: -20px;
  }

  &__class {
    display: flex;
    padding: 8px;
    font-size: 12px;
    line-height: 16px;

    &__icon {
      flex: 0 0 auto;
      max-height: 20px;
      margin-right: 4px;
    }

    &__name {
      flex: 1 0 auto;
    }
  }
}
</style>
