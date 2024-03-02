<template>
  <div class="connected-model-stage-sidebar-child">
    <sidebar-configure-section label="Options">
      <toggle
        class="connected-model-stage-sidebar-child__auto-on-off"
        size="large"
        :value="autoInstantiate"
        @input="$emit('update-config', { auto_instantiate: $event.target.checked })"
      >
        Auto On/Off
      </toggle>
    </sidebar-configure-section>
    <sidebar-configure-section label="Connected Model">
      <div class="connected-model-stage-sidebar-child__connected-model">
        <p class="connected-model-stage-sidebar-child__connected-model__prompt">
          This model outputs certain classes - What should they correspond to in
          this dataset?
        </p>
        <ul class="connected-model-stage-sidebar-child__connected-model__mapped-classes">
          <li
            class="connected-model-stage-sidebar-child__connected-model__mapped-class"
            v-for="entry in mapping"
            :key="entry.modelClass.id"
          >
            <mapped-class
              :value="entry.annotationClass"
              @update="updateMapping(entry, $event)"
              :model-class="entry.modelClass"
            />
          </li>
        </ul>
      </div>
    </sidebar-configure-section>
  </div>
</template>

<script lang="ts">
import { sortBy } from 'lodash'
import { computed, defineComponent } from 'vue'

import Toggle from '@/components/Common/Toggle/V2/Toggle.vue'
import SidebarConfigureSection from '@/components/Workflow/Sidebar/Views/Configure/Section/Section.vue'
import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import {
  AnnotationClassPayload,
  TrainingClass,
  V2ModelStagePayload
} from '@/store/types'

import MappedClass from './MappedClass.vue'

type ClassMappingEntry = {
  annotationClass: AnnotationClassPayload | null,
  modelClass: TrainingClass
}
type ClassMapping = ClassMappingEntry[]

export default defineComponent({
  name: 'ConnectedModelStageSidebarChild',
  components: {
    SidebarConfigureSection,
    MappedClass,
    Toggle
  },
  setup () {
    const store = useStore()
    const scene = useWorkflowSceneStore()
    const annotationClasses = computed(() => store.state.aclass.classes)
    const stage = computed(
      () => scene.selectedStage 
        ? scene.selectedStage as V2ModelStagePayload 
        : null
    )
    const models = computed(() => store.state.neuralModel.runningSessions)
    const selectedModelId = computed(() => scene.selectedModelId)

    const autoInstantiate = computed(() => !!stage.value?.config.auto_instantiate)
    const model = computed(() => models.value.find(m => m.id === selectedModelId.value))

    const modelClasses = computed(() => sortBy(model.value?.meta.classes || [], ['name']))

    const stageClassMapping = computed(() => stage.value?.config.class_mapping || [])
    
    const mapping = computed<ClassMapping>(() => {
      return modelClasses.value.map((modelClass): ClassMappingEntry => {
        const entry = 
          stageClassMapping.value.find((entry) => entry.model_class_label === modelClass.name)

        if (!entry) { return { annotationClass: null, modelClass } }

        const annotationClass = 
          annotationClasses.value.find(c => c.id === entry.annotation_class_id) || null

        return { annotationClass, modelClass }
      })
    })

    const updateMapping = (
      mapping: ClassMappingEntry, 
      annotationClass?: AnnotationClassPayload
    ): void  => {
      scene.setClassMapping({
        annotationClassId: annotationClass?.id || null,
        modelClassLabel: mapping.modelClass.name
      })
    }

    return { 
      autoInstantiate,
      mapping,
      updateMapping
    }
  }  
})
</script>

<style lang="scss" scoped>
.connected-model-stage-sidebar-child {
  font-family: $fontFamilyInter;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;

  &__auto-on-off {
    padding: 12px;
  }

  &__connected-model {
    padding: 10px;

    &__prompt {
      margin-bottom: 12px;
    }

    &__mapped-classes {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &__mapped-class:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}
</style>
