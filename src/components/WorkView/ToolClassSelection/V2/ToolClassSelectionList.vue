<template>
  <div class="tool-class-selection-list">
    <div class="tool-class-selection-list__search">
      <search-field
        ref="searchField"
        v-model="searchInput"
        class="classes__header__search__field"
        placeholder="Search for classes..."
        @enter="onEnter"
        @esc="$emit('esc')"
        @keydown="onKeyDown"
      />
    </div>

    <ul class="tool-class-selection-list__items">
      <tool-class-selection-item
        v-for="(annotationClass, index) in searchAnnotationClasses"
        :key="annotationClass.id"
        class="tool-class-selection-list__item"
        :annotation-class="annotationClass"
        :highlighted="index === highlightedClassIndex"
        :hotkey="getAnnotationClassHotkey(annotationClass)"
        :selected="selectedClassId === annotationClass.id"
        @select="onSelect"
      />
      <div
        v-if="searchAnnotationClasses.length === 0"
        class="tool-class-selection-list__no-item"
      >
        No matched classes
      </div>
    </ul>

    <tool-class-selection-create-item
      v-if="canCreateClass"
      class="tool-class-selection-list__create"
      :disabled="!dataset"
      @click="$emit('add-class')"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SearchField from '@/components/Common/SearchField.vue'
import ToolClassSelectionCreateItem from '@/components/WorkView/ToolClassSelection/ToolClassSelectionCreateItem.vue'
import ToolClassSelectionItem from '@/components/WorkView/ToolClassSelection/ToolClassSelectionItem.vue'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { Editor } from '@/engineV2/editor'
import {
  AnnotationClassPayload,
  AnnotationHotkeysPayload,
  DatasetPayload,
  RootState
} from '@/store/types'
import { getAnnotationClassHotkey, getDatasetClasses, getDatasetHotkeys } from '@/utils'

@Component({
  name: 'tool-class-selection-list',
  components: { SearchField, ToolClassSelectionCreateItem, ToolClassSelectionItem }
})
export default class ToolClassSelectionList extends Vue {
  @Prop({ required: true })
  annotationClasses!: AnnotationClassPayload[];

  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  @Prop({ type: Boolean, default: false })
  autoSelect!: boolean

  @State((state: RootState) => state.aclass.classes)
  allAnnotationClasses!: AnnotationClassPayload[];

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload | null

  @State((state: RootState) => state.workview.preselectedAnnotationClassId)
  selectedClassId!: number | null;

  // Highlighted class index which will be selected when enter
  highlightedClassIndex: number = 0;
  searchInput: string = ''

  $refs!: {
    searchField: SearchField
  }

  get canCreateClass (): boolean {
    return this.$can('create_annotation_class')
  }

  get searchAnnotationClasses (): AnnotationClassPayload[] {
    return this.annotationClasses.filter(c =>
      c.name.toLowerCase().indexOf(this.searchInput.toLowerCase().trim()) !== -1
    )
  }

  get datasetHotkeys (): AnnotationHotkeysPayload {
    if (!this.dataset) { return {} }
    return getDatasetHotkeys({
      annotationClasses: getDatasetClasses(this.allAnnotationClasses, this.dataset.id),
      dataset: this.dataset
    })
  }

  @Watch('selectedClassId', { immediate: true })
  onSelectedClassId () { this.maybeResetHighlightedClass() }

  @Watch('searchAnnotationClasses')
  onAnnotationClasses () { this.maybeResetHighlightedClass() }

  /**
   * A class can have a hotkey of it's own. If it does not, we give it a free one
   * auto-assigned based on class order in workview, if it's available.
   */
  getAnnotationClassHotkey (annotationClass: AnnotationClassPayload): string | null {
    const { datasetHotkeys } = this
    const matchingHotkey = getAnnotationClassHotkey(datasetHotkeys, annotationClass.id)
    return matchingHotkey || null
  }

  onSelect (annotationClassPayload: AnnotationClassPayload): void {
    const { currentTool } = this.editor.toolManager
    if (currentTool && currentTool.name === 'edit_tool') {
      const annotationClass = new AnnotationClass(annotationClassPayload)
      const changed = this.editor
        .activeView
        .annotationManager
        .maybeChangeSelectedAnnotationClass(annotationClass)
      if (changed) {
        this.$store.commit('workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE', annotationClass.id)
        this.$emit('selected', annotationClassPayload)
        return
      }
    }

    this.$store.commit('workview/PRESELECT_CLASS_ID', annotationClassPayload.id)
    this.$emit('selected', annotationClassPayload)
  }

  setSearchFocus (): void {
    this.$refs.searchField.setFocus()
  }

  maybeResetHighlightedClass (): void {
    const { searchAnnotationClasses, selectedClassId } = this
    const selectedClassIndex = selectedClassId
      ? searchAnnotationClasses.findIndex((aclass) => aclass.id === selectedClassId)
      : -1

    let highlightedClassIndex = -1
    if (selectedClassIndex > -1) {
      highlightedClassIndex = selectedClassIndex
    } else if (searchAnnotationClasses.length > 0) {
      highlightedClassIndex = 0
    }

    this.highlightedClassIndex = highlightedClassIndex
  }

  onKeyDown (event: KeyboardEvent): void {
    const count = this.searchAnnotationClasses.length
    if (event.key === 'ArrowDown') {
      if (this.highlightedClassIndex < count - 1) {
        this.highlightedClassIndex = this.highlightedClassIndex + 1
        event.preventDefault()
      }
    } else if (event.key === 'ArrowUp') {
      if (this.highlightedClassIndex > 0) {
        this.highlightedClassIndex = this.highlightedClassIndex - 1
        event.preventDefault()
      }
    }
  }

  onEnter (): void {
    const { highlightedClassIndex, searchAnnotationClasses, selectedClassId } = this
    const count = searchAnnotationClasses.length
    if (highlightedClassIndex < 0 || highlightedClassIndex >= count) { return }

    const highlightedClass = searchAnnotationClasses[highlightedClassIndex]
    if (highlightedClass.id === selectedClassId) { return }

    this.onSelect(highlightedClass)
  }

  public async mounted (): Promise<void> {
    if (this.autoSelect) {
      await this.$nextTick()
      const firstClass = this.annotationClasses[0]
      if (firstClass) { this.onSelect(firstClass) }
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-class-selection-list {
  @include col;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $colorWhite;
}

.tool-class-selection-list__search {
  margin: 6px 6px 0;
  width: calc(100% - 12px);
}

.classes__header__search__field {
  :deep(.search-field__input) {
    @include input-field-default;
  }
}

.tool-class-selection-list__items {
  @include col;
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  margin: 0;
}

.tool-class-selection-list__item {
  &:not(:last-child) {
    margin-bottom: 6px
  }
}

.tool-class-selection-list__no-item {
  color: $color90Black;
}

.tool-class-selection-list__create {
  margin-bottom: 6px;
}
</style>
