<template>
  <expansion-panels>
    <expansion-panel
      v-for="({ viewsStageAnnotations, view }, index) in viewsStageAnnotations"
      :id="view.id"
      :key="view.id"
      active-by-default
      @click="focusOn = view.id"
    >
      <template
        v-if="viewsList.length > 1"
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
          <span>{{ view.fileManager.filename }} ({{ view.fileManager.slotName }})</span>
        </div>
      </template>

      <template #content>
        <slot
          name="content"
          :views-stage-annotations="viewsStageAnnotations"
          :view="view"
          :index="index"
        />
      </template>
    </expansion-panel>
  </expansion-panels>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { ExpansionPanels, ExpansionPanel } from '@/components/Common/ExpansionPanels'
import ActiveSectionIcon from '@/components/WorkView/LayerBar/WorkflowLayerBar/ActiveSectionIcon.vue'
import { useActiveView, useEditorLayout } from '@/composables/useEditorV2'
import { View } from '@/engineV2/models'
import { StageAnnotation } from '@/store/modules/workview/types'

export default defineComponent({
  name: 'WorkflowLayerBarAccordion',
  components: {
    ExpansionPanels,
    ExpansionPanel,
    ActiveSectionIcon
  },
  props: {
    viewsStageAnnotations: {
      required: true,
      type: Array as () => { viewsStageAnnotations: StageAnnotation[], view: View }[]
    }
  },
  setup () {
    const activeView = useActiveView()
    const layout = useEditorLayout()

    const viewsList = computed(() => layout.value.viewsList)

    const focusOn = computed({
      get (): string {
        return activeView.value.id
      },
      set (id: string | null) {
        if (id === null) { return }

        const view = viewsList.value.find(view => view.id === id)

        if (!view) { return }

        layout.value.setActiveView(view)
      }
    })

    return {
      viewsList,
      focusOn
    }
  }
})
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
