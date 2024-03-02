<template>
  <v-popover
    v-if="notEmpty"
    auto-hide
    trigger="manual"
    popover-class="tooltip--white popover--tool_class_selection"
    offset="5"
    placement="bottom-start"
    :open.sync="active"
    @apply-show="onShow"
  >
    <div
      v-tooltip="tooltip"
      class="tool-class"
      :class="{ 'tool-class--active': active }"
      @click="active = true"
    >
      <div class="tool-class__selected">
        <span
          v-if="selectedColor"
          class="tool-class__selected__color-indicator"
          :style="{ backgroundColor: selectedColor }"
        />
        <span class="tool-class__selected__label">{{ selectedText }}</span>
        <span class="tool-class__selected__arrow" />
      </div>
    </div>

    <template #popover>
      <tool-class-selection-list
        ref="classList"
        :annotation-classes="classesForTool"
        :editor="editor"
        @add-class="$emit('add-class')"
        @esc="active = false"
        @selected="active = false"
      />
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  DatasetPayload,
  RootState
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { getDatasetClasses } from '@/utils'

import ToolClassSelectionList from './ToolClassSelectionList.vue'

@Component({
  name: 'tool-class-selection',
  components: { ToolClassSelectionList }
})
export default class ToolClassSelection extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.workview.preselectedAnnotationClassId)
  previousClassId!: number | null

  @State((state: RootState) => state.workview.toolAnnotationTypes)
  toolAnnotationTypes!: AnnotationTypeName[]

  active: boolean = false

  $refs!: {
    classList: ToolClassSelectionList
  }

  /**
   * Definition for tooltip is hardcoded as raw HTML, as there is no reactivity and
   * styling is shared between this and `ToolClassSelectionItem.vue`
   *
   * Styling is defined in `tooltip.scss` as `tooltip--hotkey-in-text` variation.
   */
  get tooltip (): TooltipOptions {
    return {
      content: `
        <span><span class="tooltip__hotkey">Q</span> to open.</span><br>
        <span>
          <span class="tooltip__hotkey">↑</span>
           and <span class="tooltip__hotkey">↑</span> to navigate.</span><br>
        <span><span class="tooltip__hotkey">Enter</span> to select.</span>
      `,
      classes: 'tooltip--hotkey-in-text'
    }
  }

  get notEmpty (): boolean {
    return this.toolAnnotationTypes.length > 0
  }

  get datasetClasses () {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get classesForTool (): AnnotationClassPayload[] {
    return this.datasetClasses.filter(annotationClass => this.supportedByTool(annotationClass))
  }

  get selectedClass () {
    return this.classesForTool.find(cls => cls.id === this.previousClassId)
  }

  get selectedColor (): string | null {
    if (!this.selectedClass) { return null }
    return this.selectedClass.metadata._color
  }

  get selectedText (): string {
    if (!this.selectedClass) { return 'Select Class' }
    return this.selectedClass.name
  }

  public mounted (): void {
    document.addEventListener('keydown', this.onKeyDown)
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keydown', this.onKeyDown)
    })
  }

  onKeyDown (event: KeyboardEvent) {
    if (event.key === 'q' && this.classesForTool.length > 0) {
      if (event.target) {
        // This bas been added to make the input work on workview
        // For now, we have search field on the class selection dropdown
        // In case of dropdown, we just ignore other handlers so that
        // Input can handle it on its own
        const elem = event.target as HTMLElement
        if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') { return }
      }
      event.preventDefault()
      event.stopPropagation()
      this.active = true
    }
  }

  onShow () {
    setTimeout(() => {
      const { classList } = this.$refs
      if (!classList) { return }
      classList.setSearchFocus()
    }, 100)
  }

  supportedByTool (annotationClass: AnnotationClassPayload): boolean {
    return annotationClass.annotation_types
      .some(classType => this.toolAnnotationTypes.includes(classType))
  }
}
</script>

<style lang="scss" scoped>
.tool-class {
  @include row--center;
  width: 200px;
  height: 33px;
  background: $colorWhite;
  border-radius: 3px;
  cursor: pointer;
}

.tool-class--active {
  .tool-class__selected__arrow {
    transform: rotateZ(180deg);
  }
}

.tool-class__selected {
  @include input-field-default;
  position: relative;
  @include row--center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 11px;
}

.tool-class__selected__color-indicator {
  width: 10px;
  height: 10px;
  margin-right: 9px;
  border-radius: 3px;
}

.tool-class__selected__label {
  flex: 1;
  @include typography(md, default, 700);
  @include ellipsis(1, md);
  color: $color90Black;
}

.tool-class__selected__arrow {
  position: absolute;
  right: 10px;
  top: 45%;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid $colorFeatherLight;
  border-bottom: none;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover--tool_class_selection {
  .popover-inner {
    @include col;
    width: 260px;
    max-height: 60vh;
    overflow: hidden;
    padding: 0;
    border-radius: $border-radius-default;
    background: $colorAliceBlue;
    box-shadow: 0px 5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);

    & > div:first-child {
      @include col;
      width: 100%;
      overflow: hidden;
    }
  }

  .popover-arrow {
    display: none;
  }
}
</style>
