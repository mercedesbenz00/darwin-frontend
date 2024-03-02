<template>
  <v-popover
    placement="top"
    trigger="click"
    popover-class="tags-popover"
    :offset="1"
    @show="onPopoverShow"
  >
    <slot />
    <template #popover>
      <div class="tags-popover_content">
        <tag-applier-header />
        <tag-applier-list
          can-create-tags
          :current-tags="editingTags"
          :dataset-tags="datasetTagClasses"
          :tag="tag"
          @add-tag="addTag"
          @create-tag="createTag"
        />
        <tag-applier-input
          ref="tagsInput"
          :current-tags="editingTags"
          :tag.sync="tag"
          @new-tag="onNewTag"
          @remove-tag="onRemoveTag"
        />
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TagApplierHeader from '@/components/Common/TagApplier/TagApplierHeader.vue'
import TagApplierInput from '@/components/Common/TagApplier/TagApplierInput.vue'
import TagApplierList from '@/components/Common/TagApplier/TagApplierList.vue'
import { AddTagPayload, RemoveTagPayload } from '@/components/Common/TagApplier/types'
import { matchClassByName, tagBrightenedColor } from '@/components/Common/TagApplier/utils'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetPayload,
  InputTag,
  RootState,
  StoreActionPayload
} from '@/store/types'
import { getDatasetClasses } from '@/utils'

/**
 * TagsPopover
 *
 * Creates a new tag annotation on the current uploading image.
 */
@Component({
  name: 'tags-popover',
  components: {
    TagApplierHeader,
    TagApplierInput,
    TagApplierList
  }
})
export default class TagsPopover extends Vue {
  @Prop({ required: true, type: Array as () => string[] })
  tags!: string[]

  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  $refs!: {
    tagsInput: InstanceType<typeof TagApplierInput>
  }

  get datasetClasses (): AnnotationClassPayload[] {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get datasetTagClasses (): AnnotationClassPayload[] {
    return this.datasetClasses.filter(aclass => aclass.annotation_types.includes('tag'))
  }

  get tagAnnotationType (): AnnotationTypePayload | undefined {
    return this.annotationTypes.find(t => t.name === 'tag')
  }

  public tag: string = ''

  /**
   * The vue tags input component requires a special structure of it's elements.
   *
   * This list holds that structure and is updated every time the list of currently applied tags
   * in the editor changes.
   */
  editingTags: InputTag[] = []

  @Watch('tags', { immediate: true })
  setEditingTags (): void {
    const editingTags: InputTag[] = []

    this.tags.forEach((tag) => {
      const tagClass = this.datasetTagClasses.find(aclass => aclass.name === tag)
      if (!tagClass) { return }
      editingTags.push(this.toTagItem(tagClass))
    })

    this.editingTags = editingTags
  }

  toTagItem (tagClass: AnnotationClassPayload): InputTag {
    const background = tagClass.metadata._color
      ? tagBrightenedColor(tagClass.metadata._color)
      : 'inherit'

    return {
      id: tagClass.id.toString(),
      text: tagClass.name,
      style: `background: ${background};`
    }
  }

  /**
   * Called when a user types something into the tag aplier and hits enter,
   * or by `createTag` when the button to create a tag is pushed.
   *
   * Creates a tag object locally and sends a class creation request,
   * followed by an annotation request, to the backend.
   *
   * Class can be specified, or matched via tag text.
   *
   * If unmatched, the class can be created, if the current scenario allows for it.
   *
   * If not specified, it's matched
   */
  async onNewTag (
    { tag, addTag }: AddTagPayload,
    specifiedClass?: AnnotationClassPayload
  ): Promise<void> {
    if (!this.tagAnnotationType) { return }
    const isDuplicate = tag.tiClasses && tag.tiClasses.includes('ti-duplicate')
    if (isDuplicate) {
      this.tag = ''
      return
    }

    tag.loading = true

    // Optimistic UI. If creation fails, store will roll back and tags will revert
    addTag()
    this.editingTags.push(tag)

    const matchedClass = specifiedClass || matchClassByName(this.datasetTagClasses, tag.text)
    // if existing class was matched, we end here
    if (matchedClass) { return }

    const payload: StoreActionPayload<typeof createAnnotationClass> = {
      annotationTypeNames: [this.tagAnnotationType.name],
      datasets: [{ id: this.dataset.id }],
      description: tag.text,
      images: [],
      metadata: { _color: 'auto' },
      name: tag.text
    }
    const response = await this.$store.dispatch('aclass/createAnnotationClass', payload)

    if ('error' in response) {
      this.$store.dispatch('toast/warning', { content: response.error.name })
      this.removeTag(tag.text)
    } else {
      this.emitChange()
    }

    tag.loading = false
    this.tag = ''
  }

  addTag (tagClass: AnnotationClassPayload): void {
    this.editingTags.push(this.toTagItem(tagClass))
    this.emitChange()
  }

  createTag (tag: InputTag): void {
    this.onNewTag({
      tag,
      addTag: () => {}
    })
  }

  /**
   * Called when a user clicks to remove a tag
   *
   * The payload contains a `deleteTag` function which could be used for
   * optimistic UI, but the delete action on the backend is fast enough
   * where it's not necessary.
   */
  onRemoveTag ({ tag }: RemoveTagPayload): void {
    this.removeTag(tag.text)
  }

  removeTag (text: string): void {
    const idx = this.editingTags.findIndex(editingTag => editingTag.text === text)
    if (idx >= 0) {
      this.editingTags.splice(idx, 1)
      this.emitChange()
    }
  }

  emitChange (): void {
    this.$emit('change', this.editingTags.map((tag) => tag.text))
  }

  onPopoverShow (): void {
    const { tagsInput } = this.$refs
    if (!tagsInput) { return }
    tagsInput.setFocus()
  }
}
</script>

<style lang="scss" scoped>
$popover-width: 260px;

.tags-popover_content {
  @include col;
  justify-content: center;
  width: $popover-width;
  max-height: 50vh;
  overflow: hidden;
  padding: 2px 0;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$popover-width: 260px;

.tags-popover {
  width: $popover-width;
  border-radius: 3px;
  background: $colorWhite;
  top: 5px !important;
  box-shadow: 0px -15px 30px rgba(145, 169, 192, 0.3);

  .popover-inner {
    background: white;
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
