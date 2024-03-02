<template>
  <div class="mapping">
    <div class="mapping__header">
      <h3 class="mapping__header__title">
        Map Classes
      </h3>
      <h3
        class="mapping__header__content"
      >
        This model outputs certain classes - What should they correspond to in this dataset?
      </h3>
    </div>
    <div class="mapping__body">
      <class-mapping-item
        v-for="mappedClass of mapping"
        :key="mappedClass.modelClass.name"
        :annotation-classes="annotationClasses"
        :mapped-class="mappedClass"
        @class-selected="$payload => setClass(mappedClass, $payload)"
      />
    </div>
    <div class="mapping__footer">
      <secondary-button @click="cancel">
        Cancel
      </secondary-button>
      <positive-button @click="confirm">
        Confirm
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ClassMappingItem from '@/components/DatasetSettings/ModelStage/ClassMappingItem.vue'
import {
  MappedClass,
  UnmappedClass,
  StageClassMapping
} from '@/components/DatasetSettings/ModelStage/types'
import { automapClasses, premapClasses } from '@/components/DatasetSettings/ModelStage/utils'
import { ClassMapping as ClassMappingList } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  RunningSessionPayload,
  TrainingClass,
  WorkflowStageTemplatePayload
} from '@/store/types'

@Component({
  name: 'class-mapping',
  components: { ClassMappingItem }
})
export default class ClassMapping extends Vue {
  @Prop({ required: true, type: Array as () => AnnotationClassPayload[] })
  annotationClasses!: AnnotationClassPayload[]

  @Prop({ required: true, type: Object as () => RunningSessionPayload })
  runningSession!: RunningSessionPayload

  get modelClasses (): TrainingClass[] {
    return this.runningSession.meta.classes
  }

  @Prop({ required: false, type: Object as () => WorkflowStageTemplatePayload })
  stage!: WorkflowStageTemplatePayload

  @Prop({ required: false, type: Array as () => StageClassMapping })
  stageMapping!: StageClassMapping

  @State(state => state.workview.classMapping)
  autoAnnotateClassMapping!: { [runningSessionId: string]: ClassMappingList }

  mapping: (MappedClass | UnmappedClass)[] = []

  /**
   * Class mapping can come from model stage metadata, or - in the case of auto-annotate
   * class mapping - from the `store.state.workview.classMapping` variable.
   *
   * This component is used by model stages by providing both `stage` and `stageMapping`
   * props. If both are set, then this computed returns `null`.
   *
   * Otherwise, we are interested in getting a mapping for auto-annotate (clicker tool).
   */
  get sessionMapping (): ClassMappingList | null {
    const { autoAnnotateClassMapping, runningSession, stage, stageMapping } = this

    if (stage && stageMapping) { return null }
    if (!(runningSession.id in autoAnnotateClassMapping)) { return [] }
    return autoAnnotateClassMapping[runningSession.id]
  }

  mounted (): void {
    this.automap()
  }

  /**
   * In the context of model stages (both `stage` and `stageMapping` props provided),
   * then keep the logic as is.
   *
   * Otherwise, just use pre-populate the class mapping by using the `sessionMapping` computed.
   */
  automap (): void {
    const { annotationClasses, modelClasses, sessionMapping, stage, stageMapping } = this

    if (stage && stageMapping) {
      const isNewStage = stage.id === -1
      const isPristineStage = stageMapping.length === 0
      this.mapping = isNewStage && isPristineStage
        ? automapClasses(modelClasses, annotationClasses)
        : premapClasses(modelClasses, annotationClasses, stageMapping)
    } else if (sessionMapping !== null) {
      this.mapping = premapClasses(modelClasses, annotationClasses, sessionMapping)
    }
  }

  setClass (
    mapping: (MappedClass | UnmappedClass),
    selection: AnnotationClassPayload | null
  ): void {
    mapping.annotationClass = selection
  }

  cancel (): void {
    this.$emit('cancel')
  }

  confirm (): void {
    this.$emit('confirm', this.mapping)
  }
}
</script>

<style lang="scss" scoped>
.mapping {
  border-radius: 5px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: $colorAliceLight;
  box-sizing: border-box;

  row-gap: 20px;

  height: 500px;
  min-height: 30vh;
  max-height: 75vh;
}

.mapping__header {
  background: $colorAliceBlue;
  display: grid;
  justify-content: center;
  justify-items: center;
  padding: 20px;
  row-gap: 15px;
}

.mapping__header__title {
  @include typography(lg-1, Mulish, bold);
}

.mapping__header__content {
  @include typography(md, Mulish);
  color: $colorAliceNight;
  text-align: center;
}

.mapping__body {
  @include scrollbar;

  align-content: start;

  display: grid;
  row-gap: 10px;
  overflow: auto;

  padding: 0 20px;
  margin: 0 20px;
}

.mapping__footer {
  padding: 0 20px;
  padding-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: stretch;

  > button {
    min-width: 150px;
    max-width: 40%;
  }

  > button:first-child {
    justify-self: start;
  }

  > button:last-child {
    justify-self: end;
  }
}
</style>
