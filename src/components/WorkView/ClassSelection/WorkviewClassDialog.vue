<template>
  <annotation-class-dialog
    v-if="canCreateClass"
    ref="classDialog"
    :annotation-classes="datasetClasses"
    :dataset="dataset"
    :team="currentTeam"
    @add="addedClass"
    @dataset-updated="datasetUpdated"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationClassDialog from '@/components/Classes/AnnotationClassDialog/AnnotationClassDialog.vue'
import { DefaultAnnotationClassData } from '@/components/Classes/AnnotationClassDialog/types'
import { Editor } from '@/engine/editor'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetPayload,
  RootState,
  TeamPayload
} from '@/store/types'
import { getDatasetClasses, ParsedError } from '@/utils'

@Component({
  name: 'workview-class-dialog',
  components: { AnnotationClassDialog }
})
export default class WorkviewClassDialog extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload | null

  @State((state: RootState) => state.workview.toolAnnotationTypes)
  toolAnnotationTypes!: AnnotationTypeName[]

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  $refs!: {
    classDialog: AnnotationClassDialog
  }

  get annotationType (): AnnotationTypeName {
    return this.toolAnnotationTypes[0]
  }

  get datasetClasses (): AnnotationClassPayload[] {
    if (this.dataset) {
      return getDatasetClasses(this.annotationClasses, this.dataset.id)
    } else {
      return []
    }
  }

  get canCreateClass (): boolean {
    return this.$can('create_annotation_class')
  }

  show (): void {
    const defaultPayload: DefaultAnnotationClassData = {}
    defaultPayload.selectedMainAnnotationType = this.annotationType
    this.$refs.classDialog.show(undefined, defaultPayload)
  }

  addedClass (params: { data?: AnnotationClassPayload, error?: ParsedError }): void {
    const { data, error } = params
    if (error || !data) { return }

    this.$store.commit('aclass/PUSH_CLASS', data)
    this.maybeUpdatePreselectClass(data)
  }

  datasetUpdated (dataset: DatasetPayload): void {
    this.$store.commit('workview/SET_DATASET', dataset)
  }

  maybeUpdatePreselectClass (data: AnnotationClassPayload): void {
    if (!this.supportedByTool(data)) { return }
    this.$store.commit('workview/PRESELECT_CLASS_ID', data.id)
  }

  supportedByTool (annotationClass: AnnotationClassPayload): boolean {
    return annotationClass.annotation_types.some(entry =>
      this.toolAnnotationTypes.some(type => entry === type)
    )
  }
}
</script>
