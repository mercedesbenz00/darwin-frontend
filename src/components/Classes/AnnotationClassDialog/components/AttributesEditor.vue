<template>
  <annotation-class-section title="Attributes">
    <div class="attributes-container">
      <vue-tags-input
        ref="attributeTagInput"
        v-model="attributeTag"
        avoid-adding-duplicates
        allow-edit-tags
        :add-on-blur="false"
        :delete-on-backspace="false"
        :disabled="!editing || loading"
        :placeholder="attributeInputPlaceholder"
        :tags="attributeTags"
        @before-adding-tag="attributeOnNewTag"
        @before-editing-tag="attributeOnEditTag"
        @before-saving-tag="attributeOnSaveTag"
        @tags-changed="attributeTagsChanged"
      >
        <div
          slot="tag-actions"
          slot-scope="props"
        >
          <v-popover
            trigger="manual"
            :open="attributeMenu[props.tag.id]"
            placement="right"
            popover-class="attributes-menu"
            @hide="onHideAttributeMoreMenu(props)"
          >
            <div
              class="ti-icon-more"
              @click="showAttributesMenu(props)"
            />
            <template slot="popover">
              <div
                class="attributes-menu__item"
                @click="maybeRecolorAttribute(props)"
              >
                Recolor
              </div>
              <div
                class="attributes-menu__item"
                @click="maybeRenameAttribute(props)"
              >
                Rename
              </div>
              <div
                class="attributes-menu__item"
                @click="maybeDeleteAttribute(props)"
              >
                Delete
              </div>
            </template>
          </v-popover>
          <v-popover
            trigger="manual"
            :open="attributeColorMenu[props.tag.id]"
            placement="right"
            popover-class="tooltip--white popover--colors popover--attribute-colors"
            @hide="onHideAttributeColorMenu(props)"
          >
            <div class="ti-icon-color" />
            <template slot="popover">
              <color-picker
                :colors="annotationClassColors"
                @select="onSelectAttributeColor(props, $event)"
              />
            </template>
          </v-popover>
        </div>
      </vue-tags-input>
    </div>

    <delete-confirmation-dialog
      ref="deleteAttributeDialog"
      name="delete-attribute-modal"
      button-text="REMOVE ATTRIBUTE"
      :title="deleteAttributeDialogTitle"
      :detail="deleteAttributeDialogDetails"
      @confirmed="deleteAttribute"
    />
  </annotation-class-section>
</template>

<script lang="ts">
import VueTagsInput, { VueTagsInputProp } from '@johmun/vue-tags-input'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import ColorPicker from '@/components/Classes/ColorPicker/ColorPicker.vue'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import { AttributePayload, InputTag } from '@/store/types'
import {
  errorsByCode,
  getAttributeColor
} from '@/utils'
import { annotationClassColors as v2AnnotationClassColors } from '@/utilsV2'

import AnnotationClassSection from './Common/AnnotationClassSection.vue'

@Component({
  name: 'attributes-editor',
  components: { AnnotationClassSection, ColorPicker, DeleteConfirmationDialog, VueTagsInput }
})
export default class AttributesEditor extends Vue {
  @Prop()
  annotationClassId?: number

  @Prop({ type: Boolean, default: false })
  editing!: boolean

  attributeTags: InputTag[] = []
  attributeTag = ''
  attributeMenu: Record<string, boolean> = {}
  attributeColorMenu: Record<string, boolean> = {}
  attributeTagToDelete: InputTag | null = null

  loading: boolean = false

  $refs!: {
    attributeTagInput: InstanceType<typeof VueTagsInput>
    deleteAttributeDialog: DeleteConfirmationDialog
  }

  annotationClassColors = v2AnnotationClassColors

  get attributeInputPlaceholder (): string {
    return this.editing
      ? 'Type in an attribute'
      : 'Save the annotation class to edit attributes'
  }

  get deleteAttributeDialogTitle (): string {
    if (!this.attributeTagToDelete) { return '' }
    return `Please confirm you wish to remove "${this.attributeTagToDelete.text}" attribute.`
  }

  get deleteAttributeDialogDetails (): string {
    if (!this.attributeTagToDelete) { return '' }
    const { text } = this.attributeTagToDelete
    return `This will remove the "${text}" attribute from the current annotation class.`
  }

  @Getter('attributesByAnnotationClassId', { namespace: 'aclass' })
  attributesByAnnotationClassId!: {
    [key: string]: AttributePayload[]
  }

  get assignedAttributeTags (): AttributePayload[] {
    if (!this.annotationClassId) { return [] }
    return this.attributesByAnnotationClassId[this.annotationClassId!]
  }

  get canCreateAttributes (): boolean {
    return this.$can('update_annotation_class')
  }

  /**
   * Enforce focus to the vue-tags-input input element
   */
  setFocusToAttributeInput (): void {
    const tagInputEl = this.$el.querySelector('.ti-new-tag-input') as (HTMLElement | null)
    if (!tagInputEl) { return }
    this.$nextTick(() => tagInputEl.focus())
  }

  async attributeOnNewTag (object: {tag: InputTag, addTag: () => void}): Promise<void> {
    if (!this.annotationClassId) { return }
    if (!this.canCreateAttributes) {
      return this.$store.dispatch(
        'toast/warning',
        { content: errorsByCode.ANNOTATION_CREATE_ATTRIBUTE_NOT_AUTHORIZED }
      )
    }
    if (object.tag.tiClasses && object.tag.tiClasses!.includes('ti-duplicate')) {
      this.attributeTag = ''
      return
    }

    const params = {
      classId: this.annotationClassId,
      name: object.tag.text,
      color: getAttributeColor(object.tag.text)
    }
    this.loading = true
    const {
      data,
      error
    } = await this.$store.dispatch('aclass/createOrFetchAnnotationAttribute', params)

    this.loading = false

    if (error) {
      this.attributeTag = ''
      return
    }

    // store the id instead of the text in the attribute viewer
    const tagInfo = this.tagFromAttribute(data)
    object.tag.id = tagInfo.id
    object.tag.text = tagInfo.text
    object.tag.style = tagInfo.style
    this.attributeTag = ''
    object.addTag()

    this.setFocusToAttributeInput()
  }

  attributeOnEditTag (object: {tag: InputTag, editTag: () => void}): void {
    object.editTag()
  }

  async attributeOnSaveTag (object: {tag: InputTag, saveTag: () => void}): Promise<void> {
    if (!this.annotationClassId) { return }
    if (!this.canCreateAttributes) {
      return this.$store.dispatch(
        'toast/warning',
        { content: errorsByCode.ANNOTATION_UPDATE_ATTRIBUTE_NOT_AUTHORIZED }
      )
    }

    const params = {
      classId: this.annotationClassId,
      id: object.tag.id,
      name: object.tag.text,
      color: getAttributeColor(object.tag.text)
    }
    this.loading = true
    const { data, error } = await this.$store.dispatch('aclass/updateAnnotationAttribute', params)
    this.loading = false
    if (error) { return }

    const tagInfo = this.tagFromAttribute(data)
    object.tag.style = tagInfo.style
    object.saveTag()
  }

  attributeTagsChanged (newTags: InputTag[]): void {
    if (!this.annotationClassId) { return }
    this.attributeTags = newTags
  }

  tagFromAttribute (attribute: AttributePayload): InputTag {
    return {
      id: attribute.id,
      text: attribute.name,
      style: `background: ${attribute.color}`
    }
  }

  @Watch('assignedAttributeTags')
  onAssignedAttributeTagsChange (): void {
    if (!this.assignedAttributeTags) {
      this.attributeTags = []
      return
    }
    this.attributeTags = this.assignedAttributeTags.map(this.tagFromAttribute)
  }

  showAttributesMenu (props: VueTagsInputProp): void {
    this.$set(this.attributeMenu, props.tag.id, true)
  }

  onHideAttributeMoreMenu (props: VueTagsInputProp): void {
    this.$set(this.attributeMenu, props.tag.id, false)
  }

  maybeRecolorAttribute (props: VueTagsInputProp): void {
    this.$set(this.attributeColorMenu, props.tag.id, true)
    this.onHideAttributeMoreMenu(props)
  }

  onHideAttributeColorMenu (props: VueTagsInputProp): void {
    this.$set(this.attributeColorMenu, props.tag.id, false)
  }

  async onSelectAttributeColor (props: VueTagsInputProp, color: string): Promise<void> {
    this.onHideAttributeColorMenu(props)
    const params = {
      classId: this.annotationClassId,
      id: props.tag.id,
      color
    }
    await this.$store.dispatch('aclass/updateAnnotationAttribute', params)
  }

  maybeRenameAttribute (props: VueTagsInputProp): void {
    this.$set(this.attributeMenu, props.tag.id, false)
    this.$refs.attributeTagInput.editTag(props.index)
  }

  maybeDeleteAttribute (props: VueTagsInputProp): void {
    this.$set(this.attributeMenu, props.tag.id!, false)

    this.attributeTagToDelete = props.tag
    this.$refs.deleteAttributeDialog.show()
  }

  async deleteAttribute (): Promise<void> {
    this.$refs.deleteAttributeDialog.close()
    this.$store.dispatch('ui/putBackSidebar')

    if (!this.attributeTagToDelete) { return }
    const params = {
      classId: this.annotationClassId,
      id: this.attributeTagToDelete.id!
    }
    await this.$store.dispatch('aclass/deleteAnnotationAttribute', params)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
@import "./assets/color-popover.scss";

.popover--attribute-colors {
  top: -9px !important;
}

.attributes-container {
  .vue-tags-input {
    width: 100%;
    max-width: unset !important;
    max-height: 200px;
    overflow: auto;

    border-radius: $border-radius-default;
    @include typography(md, default);
    background: $colorLineGrey !important;
    color: $colorSecondaryDark;

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
    @include typography(md, default);
    background: $colorLineGrey !important;
  }

  .ti-tag {
    @include typography(md, default);
    color: $colorSecondaryDark1 !important;
    border-radius: 5px !important;
    padding: 4px 5px 4px 7px !important;
  }

  .ti-actions {
    margin-left: 5px !important;

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

    .ti-icon-more {
      width: 13px;
      height: 6px;
      padding: 0;
      background: url('/static/imgs/more-white-icon.svg');
      background-size: contain;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .ti-icon-color {
      width: 13px;
      height: 0;
      padding: 0;
    }

    .v-popover:last-child {
      height: 0;
    }
  }
}

.attributes-menu {
  @include noSelect;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0px 20px 60px rgba(11, 36, 72, 0.2);

  .popover-inner {
    background: $colorWhite;
    border: none;
    padding: 5px 0;
  }

  .popover-arrow {
    display: none;
    background: $colorWhite;
  }

  .attributes-menu__item {
    color: $colorSecondaryDark1;
    padding: 5px 10px;
    cursor: pointer;
    @include typography(md);

    &:hover {
      background: $colorLineGrey;
    }
  }
}
</style>
