<template>
  <div class="tag-applier-list">
    <div class="tag-applier-list__tip">
      <span v-if="canCreateTags">Select a tag or create one</span>
      <span v-else>Select a tag</span>
      <sort-button
        class="tag-applier-list__sort"
        :direction.sync="sortDirection"
      />
    </div>

    <ul class="tag-applier-list__tags">
      <li
        v-for="tag in filteredTags"
        :key="tag.id"
        class="tag-applier-list__tag"
        @click="addTag(tag)"
      >
        <div
          class="tag-applier-list__tag-chip"
          :style="{ background: tagBrightenedColor(tag.metadata._color) }"
        >
          {{ tag.name }}
        </div>
      </li>
    </ul>
    <button
      v-if="canCreateTags"
      class="tag-applier-list__create"
      :disabled="!isNewTag || disabled"
      @click="createTag"
    >
      Create
      <span>{{ tag ? tag : 'Tag' }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { orderBy } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import SortButton, { SortDirection } from '@/components/Common/SortButton/V1/SortButton.vue'
import { AnnotationClassPayload, InputTag } from '@/store/types'

import { matchClassByName, tagBrightenedColor } from './utils'

@Component({
  name: 'tag-applier-list',
  components: { SortButton }
})
export default class TagApplierList extends Vue {
  @Prop({ required: true, type: Array as () => InputTag[] })
  currentTags!: InputTag[]

  @Prop({ required: true, type: Array as () => AnnotationClassPayload[] })
  datasetTags!: AnnotationClassPayload[]

  @Prop({ required: true, type: String })
  tag!: string

  @Prop({ required: false, default: false, type: Boolean })
  canCreateTags!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  readonly tagBrightenedColor = tagBrightenedColor
  sortDirection: SortDirection = SortDirection.UNSPECIFED

  /**
   * The component has a search input, so this getter returns a list of tags matching
   * the current search query, which aren't already applied to the current dataset item.
   */
  get filteredTags (): AnnotationClassPayload[] {
    const currentTags = this.currentTags.map(t => t.text.toLowerCase())
    const lowerInput = this.tag.toLowerCase()
    const filteredTags = this.datasetTags
      .filter(datasetTag => {
        const lowerTagName = datasetTag.name.toLowerCase()
        return !currentTags.includes(lowerTagName) && lowerTagName.includes(lowerInput)
      })

    switch (this.sortDirection) {
    case SortDirection.ASCENDING:
      return orderBy(filteredTags, ['name'], ['asc'])
    case SortDirection.DESCENDING:
      return orderBy(filteredTags, ['name'], ['desc'])
    default:
      return orderBy(filteredTags, ['insertedAt'], ['asc'])
    }
  }

  /** Indicates if submitting the currently typed in tag would create a new tag */
  get isNewTag (): boolean {
    if (!this.tag) { return false }
    return !matchClassByName(this.datasetTags, this.tag)
  }

  /** Called when user clicks the create tag button on the bottom */
  createTag (): void {
    if (!this.isNewTag) { return }
    const tag: InputTag = { text: this.tag }
    this.$emit('create-tag', tag)
  }

  /** Called when user selects one of existing tags */
  addTag (tagClass: AnnotationClassPayload): void {
    if (this.disabled) { return }
    this.$emit('add-tag', tagClass)
  }
}
</script>

<style lang="scss" scoped>
.tag-applier-list {
  @include col;
  flex: 1;
  overflow: hidden;
}

.tag-applier-list__tip {
  margin: 5px 10px;
  @include row;
  align-items: center;

  span {
    @include typography(sm, default, bold);
    color: $colorSecondaryLight;
    margin-right: 5px;
  }
}

.tag-applier-list__sort {
  padding: 0;
}

.tag-applier-list__tags {
  margin: 5px 0;
  padding: 0;
  flex: 1 1 auto;
  overflow-y: auto;
}

.tag-applier-list__tag {
  height: 24px;
  padding: 2px 10px;
  list-style-type: none;
  cursor: pointer;

  &:hover {
    background: $colorLineGrey;
  }
}

.tag-applier-list__tag-chip {
  width: fit-content;
  max-width: 100%;
  height: 100%;
  padding: 3px 7px;
  border-radius: $border-radius-default;
  @include ellipsis(1, sm);
  color: $colorSecondaryDark1;
}

.tag-applier-list__create {
  width: 100%;
  height: 35px;
  padding: 5px 7px;
  @include typography(md);
  @include row;
  align-items: center;
  background: $colorWhite;
  color: $colorSecondaryDark1;
  cursor: pointer;

  span {
    background: $colorSecondaryLight1;
    border-radius: $border-radius-default;
    padding: 3px 7px;
    margin-left: 2px;
  }

  &:hover:not(:disabled) {
    background: $colorSecondaryLight1Transparent;
  }

  &:disabled {
    color: $colorSecondaryLight;
  }
}
</style>
