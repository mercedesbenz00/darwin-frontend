<template>
  <expansion-panels>
    <expansion-panel
      v-for="({ stageAnnotations, view }, index) in viewsStageAnnotations"
      :id="view.id"
      :key="view.id"
      active-by-default
      @click="focusOn = view.id"
    >
      <template
        v-if="editor.viewsList.length > 1"
        #header
      >
        <div
          class="header"
          :class="{'header--active': focusOn === view.id}"
        >
          <active-section-icon
            :view="view"
            :active="focusOn === view.id"
          />
          <span v-if="view.currentItem">{{ view.currentItem.filename }} {{ index }}</span>
        </div>
      </template>

      <template #content>
        <slot
          name="content"
          :stage-annotations="stageAnnotations"
          :view="view"
          :index="index"
        />
      </template>
    </expansion-panel>
  </expansion-panels>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ExpansionPanels, ExpansionPanel } from '@/components/Common/ExpansionPanels'
import { Editor } from '@/engine/editor'
import { View } from '@/engine/models'
import { StageAnnotation } from '@/store/modules/workview/types'

import ActiveSectionIcon from './ActiveSectionIcon.vue'

@Component({
  name: 'workflow-layer-bar-expansion-panels',
  components: {
    ExpansionPanels,
    ExpansionPanel,
    ActiveSectionIcon
  }
})
export default class WorkflowLayerBarAccordion extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  @Prop({ required: true, type: Array })
  viewsStageAnnotations!: { stageAnnotations: StageAnnotation[], view: View }[]

  get focusOn (): string {
    return this.editor.activeView.id
  }

  set focusOn (id: string | null) {
    if (id === null) { return }

    const view = this.editor.viewsList.find(view => view.id === id)

    if (!view) { return }

    this.editor.layout.setActiveView(view)
  }
}
</script>

<style lang="scss" scoped>
.header {
  font-size: 13px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: calc($defaultSpace / 2);

  &.header--active {
    color: $colorDarkBlue;
  }
}
</style>
