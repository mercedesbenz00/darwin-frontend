<template>
  <v-popover
    v-if="notEmpty"
    auto-hide
    trigger="manual"
    popover-class="tooltip--white popover--tool_class_selection"
    offset="0"
    placement="bottom-start"
    :open.sync="open"
    @apply-show="onShow"
  >
    <div
      v-tooltip="tooltip"
      class="tool-class"
      :class="{ 'tool-class--open': open }"
      @click="open = true"
    >
      <div class="tool-class__input">
        <span
          v-if="selectedColor"
          class="tool-class__input__color-indicator"
          :style="{ backgroundColor: selectedColor }"
        />
        <span class="tool-class__input__label">{{ selectedText }}</span>
        <span
          class="tool-class__input__arrow"
          :class="{ 'tool-class__input__arrow--open': open }"
        >
          <chevron-icon />
        </span>
      </div>
    </div>

    <template #popover>
      <tool-class-selection-list
        ref="classList"
        :annotation-classes="classesForTool"
        :editor="editor"
        @add-class="onAddClass"
        @esc="open = false"
        @selected="open = false"
      />
    </template>
  </v-popover>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  Ref,
  SetupContext
} from 'vue'

import { ChevronIcon } from '@/components/Common/SelectField/V2'
import { useStore } from '@/composables'
import { Editor } from '@/engineV2/editor'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  DatasetPayload,
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { getDatasetClasses } from '@/utils'

import ToolClassSelectionList from './ToolClassSelectionList.vue'

export default defineComponent({
  name: 'ToolClassSelection',
  components: { ChevronIcon, ToolClassSelectionList },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (_, { emit }: SetupContext) {
    const { state } = useStore()

    const classList = ref<ToolClassSelectionList | null>(null)

    const open: Ref<Boolean> = ref(false)

    const dataset = computed((): DatasetPayload | null =>
      state.workview.dataset)
    const annotationClasses = computed((): AnnotationClassPayload[] =>
      state.aclass.classes)
    const previousClassId = computed((): number | null =>
      state.workview.preselectedAnnotationClassId)
    const toolAnnotationTypes = computed((): AnnotationTypeName[] =>
      state.workview.toolAnnotationTypes)

    /**
     * Definition for tooltip is hardcoded as raw HTML, as there is no reactivity and
     * styling is shared between this and `ToolClassSelectionItem.vue`
     *
     * Styling is defined in `tooltip.scss` as `tooltip--hotkey-in-text` variation.
     */
    const tooltip = computed((): TooltipOptions => {
      return {
        content: `
          <span><span class="tooltip__hotkey">Q</span> to open.</span><br>
          <span>
            <span class="tooltip__hotkey">↑</span>
             and <span class="tooltip__hotkey">↑</span> to navigate.
          </span><br>
          <span><span class="tooltip__hotkey">Enter</span> to select.</span>
        `,
        classes: 'tooltip--hotkey-in-text'
      }
    })

    const notEmpty = computed((): boolean => {
      return toolAnnotationTypes.value.length > 0
    })

    const datasetClasses = computed((): AnnotationClassPayload[] => {
      if (dataset.value) {
        return getDatasetClasses(annotationClasses.value, dataset.value.id)
      }
      return []
    })

    const classesForTool = computed((): AnnotationClassPayload[] => {
      return datasetClasses.value
        .filter((ac: AnnotationClassPayload) => ac.annotation_types
          .some(classType => toolAnnotationTypes.value.includes(classType))
        )
    })

    const selectedClass = computed(() => {
      return classesForTool.value
        .find(cls => cls.id === previousClassId.value)
    })

    const selectedColor = computed((): string | null => {
      if (!selectedClass.value) { return null }
      return selectedClass.value.metadata._color
    })

    const selectedText = computed((): string => {
      if (!selectedClass.value) { return 'Select Class' }
      return selectedClass.value.name
    })

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'q' && classesForTool.value.length > 0) {
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
        open.value = true
      }
    }

    const onShow = (): void => {
      setTimeout(() => {
        if (!classList.value) { return }
        classList.value.setSearchFocus()
      }, 100)
    }

    const onAddClass = (): void => {
      emit('add-class')
    }

    onMounted(() => {
      document.addEventListener('keydown', onKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onKeyDown)
    })

    return {
      classList,
      open,
      dataset,
      annotationClasses,
      previousClassId,
      toolAnnotationTypes,
      tooltip,
      notEmpty,
      datasetClasses,
      classesForTool,
      selectedClass,
      selectedColor,
      selectedText,
      onKeyDown,
      onShow,
      onAddClass
    }
  }
})
</script>

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

<style lang="scss" scoped>
$height: 36px;

.tool-class {
  @include row;
  position: relative;
  height: $height;
  max-height: $height;
  min-width: 240px;
  outline: none;

  &__input {
    @include inputFieldDefaultV2;
    @include row--distributed;
    flex: 1 1 auto;
    height: 100%;
    max-height: 100%;
    @include typography(md-1, headlines);
    border: 1px solid $colorInteractiveSecondaryHover;
    color: $colorContentDefault;
    background-color: transparent;
    padding: 0 8px;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;

    &__color-indicator {
      width: 10px;
      height: 10px;
      margin-right: 8px;
      border-radius: 2px;
    }

    &__label {
      justify-content: start;
      flex: 1;
      margin-left: 8px;
      @include ellipsis(1, md);
      @include typography(md, inter, 500);
      text-transform: capitalize;
    }

    &__arrow {
      position: absolute;
      right: 8px;
      top: 8px;

      &--open {
        transform: rotateZ(-180deg);
        bottom: 8px;
      }
    }
  }
}
</style>
