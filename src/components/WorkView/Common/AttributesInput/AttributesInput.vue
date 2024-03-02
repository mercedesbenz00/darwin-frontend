<template>
  <div
    v-click-outside="onBlur"
    class="workview-attributes"
  >
    <vue-tags-input
      ref="input"
      v-model="tag"
      :tags="tags"
      avoid-adding-duplicates
      :disabled="!masterAnnotation"
      placeholder="Add Attribute"
      @tags-changed="saveAllTags"
      @before-adding-tag="onEnterCreateTag"
    />
    <span class="workview-attributes__tip">Select a attribute or create one</span>
    <ul class="workview-attributes__tags">
      <li
        v-for="(attributeTag, index) in filteredList"
        :id="`attribute-tag-${attributeTag.id}`"
        :key="attributeTag.id"
        class="workview-attributes__tag"
        :class="{ 'workview-attributes__tag--highlighted': index === highlightedTagIndex }"
        @click.stop="onApplyExistingAttribute(attributeTag)"
      >
        <div
          class="workview-attributes__tag-chip"
          :style="{ background: attributeTag.color }"
        >
          {{ attributeTag.name }}
        </div>
      </li>
    </ul>
    <button
      v-if="canCreateAttributes"
      class="workview-attributes__create"
      :disabled="!isNewTag"
      @click.stop="onClickCreateTag"
    >
      Create <span> {{ tag ? tag : 'Attribute' }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import VueTagsInput from '@johmun/vue-tags-input'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { addOrUpdateSubAnnotation } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'
import { Attributes } from '@/engine/plugins/attributes/types'
import { tagFromAttribute } from '@/engine/plugins/attributes/utils'
import { AttributePayload, DatasetPayload, InputTag, RootState } from '@/store/types'
import { errorsByCode, getAttributeColor } from '@/utils'

@Component({
  name: 'attributes-input',
  components: {
    VueTagsInput
  }
})
export default class AttributesInput extends Vue {
  @Prop({ required: true, type: Array })
  tags!: InputTag[]

  @Prop({ type: Object })
  masterAnnotation!: Annotation | null

  @Prop({ required: true, type: Object })
  editor!: Editor

  @Getter('attributesByAnnotationClassId', { namespace: 'aclass' })
  attributesByAnnotationClassId!: { [key: string]: AttributePayload[] }

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  public tag: string = ''

  /** Highlighted tag index which will be selected when enter */
  highlightedTagIndex: number = 0;

  $refs!: Vue['$refs'] & {
    input: InstanceType<typeof VueTagsInput>
  }

  mounted (): void {
    setTimeout(() => {
      // vue-tags-input component doesn't provide a method to set focus to the input
      // We are finding the input element inside the `Tag Input` and setting focus
      // when this component has been mounted.
      const { inputEl } = this
      if (!inputEl) { return }
      inputEl.addEventListener('keydown', this.onKeyDown)
      inputEl.focus()
    }, 200)
  }

  get inputEl (): HTMLElement | null {
    if (!this.$refs.input) { return null }
    const tagBoxEl = this.$refs.input.$el as HTMLElement
    const inputEl = tagBoxEl.querySelector('input.ti-new-tag-input') as HTMLElement
    if (!inputEl) {
      throw new Error('vue-tags-input internal structure seems to have changed')
    }
    return inputEl
  }

  get filteredList (): AttributePayload[] {
    const currentTags = this.tags.map(t => t.text.toLowerCase())
    if (!this.attributeTags) { return [] }
    return this.attributeTags
      .filter(c => !currentTags.includes(c.name.toLowerCase()))
      .filter(c => c.name.toLowerCase().includes(this.tag.toLowerCase()))
  }

  get attributeTags (): AttributePayload[] {
    if (!this.masterAnnotation) { return [] }
    return this.attributesByAnnotationClassId[this.masterAnnotation.classId] || []
  }

  get isNewTag (): boolean {
    return !!this.tag && this.isNew(this.tag)
  }

  @Watch('filteredList', { immediate: true })
  onFilterListChange (): void {
    this.maybeResetHighlightedTag()
  }

  maybeResetHighlightedTag (): void {
    const { filteredList } = this
    this.highlightedTagIndex = filteredList.length > 0 ? 0 : -1
  }

  isNew (text: string): boolean {
    return !this.tags.find(c => text.toLowerCase() === c.text.toLowerCase())
  }

  setInputFocus (): void {
    const { inputEl } = this
    if (!inputEl) { return }
    inputEl.focus()
  }

  onBlur (): void {
    this.resetInput()
  }

  onClickCreateTag (): void {
    if (!this.isNewTag) { return this.resetInput() }
    this.addTag(this.tag)
  }

  scrollToHighlightedTag (): void {
    const { filteredList, highlightedTagIndex } = this
    if (highlightedTagIndex < 0) { return }

    const attributeTag = filteredList[highlightedTagIndex]
    const tagEl = document
      .querySelector(`#attribute-tag-${attributeTag.id}.workview-attributes__tag`)
    if (!tagEl) { return }
    tagEl.scrollIntoView()
  }

  onKeyDown (evt: KeyboardEvent): void {
    if (evt.key === 'ArrowDown') {
      const count = this.filteredList.length
      if (this.highlightedTagIndex < count - 1) {
        this.highlightedTagIndex = this.highlightedTagIndex + 1
      }

      this.scrollToHighlightedTag()
    } else if (evt.key === 'ArrowUp') {
      if (this.highlightedTagIndex > 0) {
        this.highlightedTagIndex = this.highlightedTagIndex - 1
      } else {
        this.highlightedTagIndex = -1
      }

      this.scrollToHighlightedTag()
    } else if (evt.key === 'Enter' || evt.key === 'Tab') {
      // If you press enter on highlighted tag index, press enter
      if (this.highlightedTagIndex >= 0) {
        this.onApplyExistingAttribute(this.filteredList[this.highlightedTagIndex])
        this.resetInput()
      }
    } else if (evt.key === 'Escape') {
      // If esc is pressed, destroy the component
      const { inputEl } = this
      if (inputEl) {
        inputEl.removeEventListener('keydown', this.onKeyDown)
      }
      this.$emit('hide')
    } else if (!['.', ','].includes(evt.key)) {
      return
    }

    evt.preventDefault()
    evt.stopPropagation()
  }

  /**
   * Triggered when user types in a tag name and hits enter
   *
   * Checks if a tag with that name already exists and if not, goes to create process
   */
  onEnterCreateTag (object: { tag: InputTag }): void {
    if (!this.isNew(object.tag.text)) { return this.resetInput() }
    if (this.highlightedTagIndex >= 0) { return }

    this.addTag(object.tag.text)
  }

  get canCreateAttributes (): boolean {
    return this.$can('update_annotation_class', {
      subject: 'dataset',
      resource: this.dataset
    })
  }

  private async addTag (text: string): Promise<void> {
    if (!this.masterAnnotation) { return this.resetInput() }
    if (!this.canCreateAttributes) {
      this.$store.dispatch(
        'toast/warning',
        { content: errorsByCode.ANNOTATION_CREATE_ATTRIBUTE_NOT_AUTHORIZED }
      )
      return this.resetInput()
    }

    const params = {
      classId: this.masterAnnotation.classId,
      name: text,
      color: getAttributeColor(text)
    }

    const { data } = await this.$store.dispatch('aclass/createOrFetchAnnotationAttribute', params)
    if (data) { this.saveAllTags([...this.tags, tagFromAttribute(data)]) }

    this.resetInput()
  }

  private resetInput (): void {
    this.tag = ''
  }

  onApplyExistingAttribute (attribute: AttributePayload): void {
    if (!this.masterAnnotation) { return }
    this.saveAllTags([...this.tags, tagFromAttribute(attribute)])

    this.resetInput()
  }

  async saveAllTags (newTags: InputTag[]): Promise<void> {
    if (!this.masterAnnotation) { return }
    this.$emit('update:tags', newTags)

    const data: Attributes = { attributes: newTags.map(elem => elem.id!) }

    const annotation = this.editor
      .initializeSubAnnotation('attributes', this.masterAnnotation, data)
    if (!annotation) { return }
    const action = addOrUpdateSubAnnotation(this.editor, annotation, this.masterAnnotation)
    await this.editor.actionManager.do(action)
  }
}
</script>

<style lang="scss" scoped>
.workview-attributes {
  background: $colorWhite;
  border-radius: $border-radius-default;
  overflow: hidden;

  .vue-tags-input {
    border-radius: $border-radius-default;
    @include typography(md, default);
    background: $colorLineGrey !important;
    color: $colorSecondaryDark;
    max-height: 200px;
    overflow: auto;

    input::-webkit-input-placeholder {
      color: $colorSecondaryLight;
    }

    input::-moz-placeholder {
      color: $colorSecondaryLight;
    }

    input:-moz-placeholder {
      color: $colorSecondaryLight;
    }

    input:-ms-input-placeholder {
      color: $colorSecondaryLight;
    }
  }

  .ti-input {
    @include typography(md, default);
    padding: 6px 4px !important;
    border: none !important;
    background: $colorLineGrey !important;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  }

  .ti-new-tag-input {
    background: $colorLineGrey !important;
  }

  .ti-tag {
    color: $colorSecondaryDark1 !important;
    border-radius: $border-radius-default !important;
    padding: 4px 5px 4px 7px !important;
  }

  .ti-actions {
    .ti-icon-loading {
      background: url('/static/imgs/spinner.svg');
      background-size: 10px 10px;
      width: 10px;
      height: 10px;
      margin-right: -3px; // This is the margin to reduce the right space
      border: none;
      background-repeat: no-repeat;
    }

    i::before {
      color: rgba(0, 0, 0, 0.3);
    }

    i:hover {
      &::before {
        color: $colorSecondaryLight1;
      }
    }
  }

  .workview-attributes__tip {
    margin: 5px 10px;
    @include typography(sm, default, bold);
    color: $colorSecondaryLight;
  }

  .workview-attributes__tags {
    margin: 5px 0;
    padding: 0;
    height: 100px;
    overflow: auto;
  }

  .workview-attributes__tag {
    height: 30px;
    padding: 5px 10px;
    list-style-type: none;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
      background: $colorAliceShade;
    }
  }

  .workview-attributes__tag--highlighted {
    background: $colorAliceShade;
  }

  .workview-attributes__tag-chip {
    @include row;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    height: 100%;
    padding: 5px 7px;
    border-radius: $border-radius-default;
    @include typography(sm);
    color: $colorSecondaryDark1;
  }

  .workview-attributes__create {
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
}
</style>
