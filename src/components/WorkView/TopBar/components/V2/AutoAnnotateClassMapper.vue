<template>
  <div class="auto-annotate-class-mapper">
    <secondary-button
      class="auto-annotate-class-mapper__button"
      size="medium"
      @click="openMappingDialog"
    >
      Map Classes
    </secondary-button>
    <modal
      name="auto-annotate-mapping"
      height="auto"
      :width="500"
    >
      <class-mapping
        :annotation-classes="datasetClasses"
        :running-session="session"
        @cancel="closeMappingDialog"
        @confirm="updateMapping"
      />
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ClassMapping from '@/components/DatasetSettings/ModelStage/ClassMapping.vue'
import { MappedClass } from '@/components/DatasetSettings/ModelStage/types'
import { toClassMapping } from '@/components/DatasetSettings/ModelStage/utils'
import { updateClassMapping } from '@/store/modules/workview/actions/updateClassMapping'
import {
  AnnotationClassPayload,
  DatasetPayload,
  RootState,
  RunningSessionPayload,
  StoreActionPayload
} from '@/store/types'

@Component({ name: 'auto-annotate-class-mapper', components: { ClassMapping } })
export default class AutoAnnotateClassMapper extends Vue {
  @State((state: RootState) => state.aclass.classes)
  allClasses!: AnnotationClassPayload[]

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  get datasetClasses (): AnnotationClassPayload[] {
    const { allClasses, dataset } = this
    return allClasses.filter(c => c.datasets.some(d => d.id === dataset.id))
  }

  get autoAnnotateModels (): RunningSessionPayload[] {
    return this.$store.state.workview.autoAnnotateModels
  }

  get session (): RunningSessionPayload | null {
    const { preselectedModelId: id } = this.$store.state.workview
    const { autoAnnotateModels } = this
    return autoAnnotateModels.find(m => m.id === id) || null
  }

  openMappingDialog (): void {
    this.$modal.show('auto-annotate-mapping')
  }

  closeMappingDialog (): void {
    this.$modal.hide('auto-annotate-mapping')
  }

  updateMapping (mapping: MappedClass[]): void {
    const { session } = this
    if (!session) { return }

    const classMapping = mapping.map(toClassMapping)
    const payload: StoreActionPayload<typeof updateClassMapping> = {
      classMapping,
      runningSessionId: session.id
    }
    this.$store.dispatch('workview/updateClassMapping', payload)

    this.closeMappingDialog()
  }
}
</script>

<style lang="scss" scoped>
.auto-annotate-class-mapper {
  margin: 0 10px;
}

.auto-annotate-class-mapper__button {
  @include typography(md, defult, 500);
  font-family: $fontFamilyInter;
  letter-spacing: 0;
  width: 100px;
  height: 32px;
  padding: 8px;
  border: 1px solid $colorInteractiveSecondaryHover;
  box-sizing: border-box;
  border-radius: 8px;
}

.auto-annotate-class-mapper__button:hover {
  background-color: $colorOverlayHover;
  border: 1.5px solid $colorInteractiveSecondaryHover;
}
</style>
