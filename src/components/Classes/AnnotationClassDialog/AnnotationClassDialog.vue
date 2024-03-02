<template>
  <modal
    name="annotation-class"
    transition="pop-out"
    :min-width="350"
    :max-width="600"
    width="35%"
    height="80%"
    :classes="['annotation-class-modal']"
    :click-to-close="false"
  >
    <div class="modal__header">
      <p class="modal__header__title">
        {{ editing ? 'Edit annotation class' : 'Create a new Annotation Class' }}
      </p>
      <p class="modal__header__text">
        Classes are unique to this team. Add them quickly via the quick-add
        button or customize them below by adding sub-annotation, descriptions,
        or thumbnails.
      </p>
    </div>
    <div
      ref="content"
      class="modal__content modal__content-annotation"
    >
      <annotation-class-section
        title="Class Name and Color"
        :error="errors.name"
      >
        <div class="annotation-class__name">
          <class-color
            :color.sync="annotationClass.metadata._color"
          />
          <input-field
            v-model="annotationClass.name"
            @enter="onQuickAdd"
          />
          <hotkey-input
            :disabled="!dataset"
            :hotkey.sync="hotkey"
          />
          <quick-add
            v-if="!editing"
            :disabled="!annotationClass.name"
            @click="onQuickAdd"
          />
        </div>
      </annotation-class-section>
      <annotation-type-select
        ref="annotationTypeSelect"
        :editing="editing"
        :error.sync="errors.annotationTypes"
        :selected-annotation-type.sync="selectedMainAnnotationType"
      />
      <annotation-sub-type-select
        v-if="selectedMainAnnotationType"
        :main-annotation-type="selectedMainAnnotationType"
        :original-sub-type-selections="originalSubTypeSelections"
        :type-selections.sync="selectedSubAnnotationTypes"
      />
      <attributes-editor
        v-if="showAttributeEditor"
        :annotation-class-id="annotationClass.id"
        :editing="editing"
      />
      <skeleton-editor
        v-if="showSkeletonEditor"
        ref="skeletonEditor"
        :editing="editing"
        :error="errors.skeleton"
        :skeleton="annotationClass.metadata.skeleton"
        :stroke-color="annotationClass.metadata._color"
        @change="$event => rawSkeleton = $event"
      />
      <description :description.sync="annotationClass.description" />
      <class-thumbnails
        class="annotation-class__thumbnails"
        :class-name="annotationClass.name || ''"
        :class-color="color"
        :images.sync="annotationClass.images"
        :team="team"
      />
    </div>
    <div class="modal__footer">
      <secondary-button @click="close">
        Cancel
      </secondary-button>
      <positive-button
        :disabled="disabled || loading"
        @click="saveClass"
      >
        {{ editing ? 'SAVE' : 'ADD CLASS' }}
      </positive-button>
    </div>
  </modal>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash'
import { v4 as uuid4 } from 'uuid'
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { updateAnnotationClass } from '@/store/modules/aclass/actions/updateAnnotationClass'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  TeamPayload,
  StoreActionPayload,
  DatasetPayload,
  RootState,
  SkeletonMetadata,
  AnnotationClassMetadata
} from '@/store/types'
import {
  errorsByCode,
  notifyErrorByCode
} from '@/utils'
import { getAutoAnnotationClassColor } from '@/utilsV2'

import ClassColor from './ClassColor.vue'
import ClassThumbnails from './ClassThumbnails.vue'
import AnnotationSubTypeSelect from './components/AnnotationSubTypeSelect.vue'
import AnnotationTypeSelect from './components/AnnotationTypeSelect.vue'
import AttributesEditor from './components/AttributesEditor.vue'
import AnnotationClassSection from './components/Common/AnnotationClassSection.vue'
import Description from './components/Description.vue'
import HotkeyInput from './components/HotkeyInput.vue'
import QuickAdd from './components/QuickAdd.vue'
import SkeletonEditor from './components/SkeletonEditor/SkeletonEditor.vue'
import {
  AnnotationClassData,
  AnnotationClassValidationErrors,
  DefaultAnnotationClassData,
  isClassImage
} from './types'

const newClass = (): AnnotationClassData => ({
  id: null,
  name: null,
  description: null,
  hotkey: null,
  images: [
    { id: uuid4(), index: 0 },
    { id: uuid4(), index: 1 },
    { id: uuid4(), index: 2 },
    { id: uuid4(), index: 3 },
    { id: uuid4(), index: 4 }
  ],
  metadata: { _color: 'auto', skeleton: { nodes: [], edges: [] } },
  datasets: []
})

const saveableImages = (data: AnnotationClassData): AnnotationClassPayload['images'] => {
  const images: AnnotationClassPayload['images'] = []
  data.images.forEach(i => {
    if (isClassImage(i)) { images.push(i) }
  })
  return images
}

@Component({
  name: 'annotation-class-dialog',
  components: {
    AnnotationClassSection,
    AnnotationSubTypeSelect,
    AnnotationTypeSelect,
    AttributesEditor,
    ClassColor,
    ClassThumbnails,
    Description,
    HotkeyInput,
    InputField,
    QuickAdd,
    SkeletonEditor
  }
})
export default class AnnotationClassDialog extends Vue {
  @Prop({ required: true })
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  @Prop({ required: true })
  team!: TeamPayload

  @Prop({ required: false })
  dataset!: DatasetPayload | null

  annotationClass: AnnotationClassData = newClass()

  get editing (): boolean {
    return !!this.annotationClass.id
  }

  selectedMainAnnotationType: AnnotationTypeName | null = null
  selectedSubAnnotationTypes: Partial<Record<AnnotationTypeName, boolean>> = {}
  originalSubTypeSelections: Partial<Record<AnnotationTypeName, boolean>> = {}

  rawSkeleton: SkeletonMetadata | null = null

  itemLoading: boolean = false
  loading: boolean = false

  hotkey: string | null = null

  $refs!: {
    content: HTMLDivElement
    annotationTypeSelect: AnnotationTypeSelect
    skeletonEditor: SkeletonEditor
  }

  errors: AnnotationClassValidationErrors = {}

  get showAttributeEditor (): boolean {
    return !!this.selectedSubAnnotationTypes.attributes
  }

  get showSkeletonEditor (): boolean {
    return this.selectedMainAnnotationType === 'skeleton'
  }

  get disabled (): boolean {
    return (
      this.loading ||
      this.annotationClass.name === null ||
      isEmpty(this.annotationClass.name)
    )
  }

  get disableAttributes (): boolean {
    return !this.editing
  }

  get attributeInputPlaceholder (): string {
    return this.disableAttributes
      ? 'Save the annotation class to edit attributes'
      : 'Type in an attribute'
  }

  /**
   * Used by parent component to open the dialog and initialize the data
   *
   * `WorkviewClassDialog.vue` wraps this one, to extend it's features
   *
   * @param {AnnotationClassPayload | undefined} data
   *
   * Will be set if editing an existing class. Will not be set if creating a new class from the
   * classes or instructions tab.
   *
   * @param {DefaultAnnotationClassData | undefined} defaultClassData
   *
   * Will be set when creating a new class from dialog wrapped within `WorkfviewClassDialog`
   */
  show (
    data?: AnnotationClassPayload,
    defaultClassData?: DefaultAnnotationClassData
  ) {
    this.resetForm()
    this.setErrors({})

    this.itemLoading = false
    this.loading = false

    if (data) {
      this.loadFromData(data)
    } else if (defaultClassData) {
      const { selectedMainAnnotationType, ...other } = defaultClassData
      this.annotationClass = {
        ...this.annotationClass,
        ...other
      }
      if (selectedMainAnnotationType) {
        this.selectedMainAnnotationType = selectedMainAnnotationType
      }
    } else {
      this.annotationClass = newClass()
    }

    this.$store.dispatch('ui/putBackSidebar')
    this.$modal.show('annotation-class')

    document.addEventListener('keydown', this.enterHandler)

    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keydown', this.enterHandler)
    })
  }

  close () {
    document.removeEventListener('keydown', this.enterHandler)

    this.$modal.hide('annotation-class')
    this.$store.dispatch('ui/bringFrontSidebar')
    this.$emit('cancel')
  }

  enterHandler (event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.editing) {
      event.stopPropagation()
      this.onQuickAdd()
    }
  }

  setErrors (errors: AnnotationClassValidationErrors) {
    if (!errors) { return }

    // some errors are read from this data field rendered directly from template
    this.errors = errors
    this.scrollToFirstError(errors)

    // if there are errors the loading should stop
    this.loading = false
  }

  /**
   * Since the dialog is taller than the page,
   * we want to make sure the first render error is in view.
   *
   * This function scrolls the dialog to the first error, from the top: which is displayed.
   */
  scrollToFirstError (errors: AnnotationClassValidationErrors) {
    if (errors.name) {
      return this.$refs.content && this.$refs.content.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (errors.annotationTypes) {
      return this.$refs.annotationTypeSelect && this.$refs.annotationTypeSelect.scrollTo()
    }

    if (errors.skeleton) {
      return this.$refs.skeletonEditor && this.$refs.skeletonEditor.scrollTo()
    }

    return this.$refs.content && this.$refs.content.scrollTo({ top: 0, behavior: 'smooth' })
  }

  get annotationTypeNames (): AnnotationTypeName[] {
    const {
      selectedMainAnnotationType,
      selectedSubAnnotationTypes
    } = this

    const typeNames: AnnotationTypeName[] =
      Object.entries(selectedSubAnnotationTypes)
        .filter<[AnnotationTypeName, boolean]>(
          (entry): entry is [AnnotationTypeName, boolean] => !!entry[1]
        )
        .map(([k]) => k)

    if (selectedMainAnnotationType) {
      typeNames.unshift(selectedMainAnnotationType)
    }

    return typeNames
  }

  get color (): string {
    const { _color: color } = this.annotationClass.metadata
    return color === 'auto'
      ? getAutoAnnotationClassColor()
      : color
  }

  get metadata (): AnnotationClassMetadata {
    const metadata = { ...this.annotationClass.metadata }
    metadata._color = this.color

    if (this.selectedMainAnnotationType === 'skeleton' && this.rawSkeleton) {
      metadata.skeleton = this.rawSkeleton
    } else {
      metadata.skeleton = undefined
    }

    return metadata
  }

  validate () {
    // Name
    if (!this.annotationClass.name) {
      this.setErrors({ name: errorsByCode.ANNOTATION_CLASS_NAME_EMPTY })
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_NAME_EMPTY')
      return false
    }

    // Type
    if (!this.annotationTypeNames.length) {
      this.setErrors({ annotationTypes: errorsByCode.ANNOTATION_CLASS_TYPE_NON_SELECTED })
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_TYPE_NON_SELECTED')
      return false
    }

    // Thumbnail image
    if (this.itemLoading) {
      notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_THUMBNAIL_NOT_LOADED')
      return false
    }

    const metadata = this.metadata
    // SkeletonEditor
    if (this.showSkeletonEditor) {
      if (!metadata.skeleton) {
        this.setErrors({ skeleton: errorsByCode.ANNOTATION_CLASS_SKELETON_EMPTY })
        notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_SKELETON_EMPTY')
        return false
      }
      const { edges, nodes } = metadata.skeleton
      if (edges.length === 0 || nodes.length === 0) {
        this.setErrors({ skeleton: errorsByCode.ANNOTATION_CLASS_SKELETON_EMPTY })
        notifyErrorByCode(this.$store, 'ANNOTATION_CLASS_SKELETON_EMPTY')
        return false
      }
    }

    return true
  }

  async onQuickAdd () {
    if (this.disabled || this.loading) { return }
    if (!this.validate()) { return }
    const { error } = await this.addClass()
    if (error) { return }
    this.resetFormAfterQuickAdd()
  }

  async saveClass () {
    this.loading = true

    this.errors = {}
    if (!this.validate()) {
      this.loading = false
      return false
    }

    const response = this.editing
      ? await this.updateClass()
      : await this.addClass()

    if (response.error) {
      this.loading = false
      return
    }

    this.loading = false
    this.close()
  }

  async addClass () {
    if (!this.annotationClass.name) {
      throw new Error('Data was reported valid, but keys are missing')
    }

    const payload: StoreActionPayload<typeof createAnnotationClass> = {
      annotationTypeNames: this.annotationTypeNames,
      datasets: this.dataset ? [{ id: this.dataset.id }] : [],
      description: this.annotationClass.description,
      images: saveableImages(this.annotationClass),
      metadata: this.metadata,
      name: this.annotationClass.name
    }

    const { data, error } = await this.$store.dispatch('aclass/createAnnotationClass', payload)

    if (error) {
      this.onError(error)
      this.loading = false
      this.$emit('add', { error })
      return { error }
    }

    await this.saveHotkey(data.id)

    this.loading = false
    this.$store.dispatch('toast/notify', { content: `${this.annotationClass.name} added` })
    this.$emit('add', { data })

    return { data }
  }

  async updateClass () {
    if (!this.annotationClass.id || !this.annotationClass.name) {
      throw new Error('Data was reported valid, but keys are missing')
    }

    const payload: StoreActionPayload<typeof updateAnnotationClass> = {
      annotationTypeNames: this.annotationTypeNames,
      description: this.annotationClass.description,
      id: this.annotationClass.id,
      images: saveableImages(this.annotationClass),
      metadata: this.metadata,
      name: this.annotationClass.name,
      datasets: this.annotationClass.datasets
    }

    const { data, error } = await this.$store.dispatch('aclass/updateAnnotationClass', payload)

    if (error) {
      this.onError(error)
      this.loading = false
      this.$emit('update', { error })
      return { error }
    }

    await this.saveHotkey(this.annotationClass.id)

    this.loading = false
    this.$store.dispatch('toast/notify', { content: `${data.name} updated` })
    this.$emit('update', { data })
    return { data }
  }

  async saveHotkey (classId: number) {
    const { annotationClass, annotationClasses, dataset, hotkey } = this

    if (!dataset) { return }
    if (!hotkey) { return }

    const { annotation_hotkeys: hotkeys } = dataset

    // Check if there was another class to which the same hotkey was assigned
    const dupClassId: number | null = (hotkeys[hotkey])
      ? parseInt(hotkeys[hotkey].replace('select_class:', ''), 10)
      : null

    const newHotkeys = {
      ...hotkeys,
      [hotkey]: `select_class:${classId}`
    }

    const payload: StoreActionPayload<typeof updateDataset> = {
      dataset,
      params: { annotationHotkeys: newHotkeys }
    }

    const response = await this.$store.dispatch('dataset/updateDataset', payload)
    if ('error' in response) { return response }

    this.$emit('dataset-updated', response.data)

    // Show notification for newly assigned hotkey
    this.$store.dispatch('toast/notify', {
      content: `${annotationClass.name} hotkey set to ${hotkey}`
    })

    // Show notification for annotation class whose hotkey was unbound
    if (dupClassId) {
      const dupAnnotationClass = annotationClasses.find(aclass => aclass.id === dupClassId)
      if (!dupAnnotationClass) { return response }
      this.$store.dispatch('toast/notify', {
        content: `${dupAnnotationClass.name} hotkey has been unbound`
      })
    }

    return response
  }

  onError (err: AnnotationClassValidationErrors) {
    this.setErrors(err)

    if (err.name) {
      this.$store.dispatch('toast/warning', { content: `Name ${err.name.toLowerCase()}` })
    }

    if (err.annotationTypes) {
      this.$store.dispatch(
        'toast/warning',
        { content: `Annotation type ${err.annotationTypes.toLowerCase()}` }
      )
    }
  }

  loadFromData (data: AnnotationClassPayload): void {
    this.setMainAnnotationType(data)
    this.preselectTypesWithBackup(data)
    this.maybePreloadAttributes(data)

    this.annotationClass = {
      id: data.id,
      name: data.name,
      description: data.description,
      hotkey: this.loadHotkey(data),
      metadata: cloneDeep(data.metadata),
      images: [
        { id: uuid4(), index: 0, ...(data.images.find(i => i.index === 0) || {}) },
        { id: uuid4(), index: 1, ...(data.images.find(i => i.index === 1) || {}) },
        { id: uuid4(), index: 2, ...(data.images.find(i => i.index === 2) || {}) },
        { id: uuid4(), index: 3, ...(data.images.find(i => i.index === 3) || {}) },
        { id: uuid4(), index: 4, ...(data.images.find(i => i.index === 4) || {}) }
      ],
      datasets: data.datasets
    }

    this.hotkey = this.loadHotkey(data)
  }

  loadHotkey (data: AnnotationClassPayload): null | string {
    const { dataset } = this
    if (!dataset) { return null }
    const { annotation_hotkeys: hotkeys } = dataset
    const existingHotkey = Object.entries(hotkeys)
      .find((entry) => entry[1] === `select_class:${data.id}`)
    return existingHotkey ? existingHotkey[0] : null
  }

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  private setMainAnnotationType (data: AnnotationClassPayload): void {
    const mainAnnotationType = this.getMainAnnotationType(data)
    this.selectedMainAnnotationType = mainAnnotationType.name
  }

  /**
   * track currently selected types as well as types who's value was not changed by user
   * using two separate maps
   */
  private preselectTypesWithBackup (data: AnnotationClassPayload): void {
    this.annotationTypes.forEach((type) => {
      const selected = data.annotation_types.includes(type.name)
      if (type.granularity === 'sub') {
        this.selectedSubAnnotationTypes[type.name] = selected
        this.originalSubTypeSelections[type.name] = selected
      }
    })
  }

  private maybePreloadAttributes (data: AnnotationClassPayload): void {
    const containsAttributesSubAnnotation = this.annotationTypes.find(
      atype => atype.granularity === 'sub' && atype.name === 'attributes'
    )

    if (data.id && containsAttributesSubAnnotation) {
      this.$store.dispatch('aclass/loadClassAnnotationAttributes', { classId: data.id })
    }
  }

  resetForm () {
    this.annotationClass = newClass()
    this.selectedMainAnnotationType = null
    this.selectedSubAnnotationTypes = {}
    this.originalSubTypeSelections = {}
    this.hotkey = null
  }

  resetFormAfterQuickAdd () {
    this.annotationClass.name = ''
    this.annotationClass.description = ''
    this.annotationClass.metadata = {
      _color: 'auto',
      skeleton: { nodes: [], edges: [] }
    }
    this.hotkey = null
  }
}
</script>

<style lang="scss" scoped>
.modal__header {
  background: $colorAliceShade;
  padding: 18px 30px;
}

.modal__header__text {
  @include typography(md);
  margin: 10px 0 0 0;
  color: $colorAliceNight;
}

.modal__content-annotation {
  padding: 30px;
  background: $colorAliceBlue;
  overflow: hidden auto;

  display: grid;
  grid-auto-flow: row;
  row-gap: 30px;
}

.modal__footer {
  background: $colorAliceBlue;
  box-shadow: 0px -5px 10px rgba(145, 169, 192, 0.1) !important;
  overflow: visible;

  button {
    flex: 1;
    margin: 0 10px;
  }
}

.annotation-class__name {
  display: flex;
  padding: 0;
  width: 100%;
  gap: 10px;
  input-field {
    flex-shrink: 1;
  }
}

.annotation-class__thumbnails {
  padding-bottom: 20px;
}
</style>
