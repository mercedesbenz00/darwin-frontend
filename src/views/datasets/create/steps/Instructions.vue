<template>
  <div
    class="dataset-create__box dataset-create__box--instructions"
    :class="{ 'dataset-create__v2': isV2Dataset }"
  >
    <div class="dataset-instructions__row dataset-instructions__row--title">
      <div class="dataset-instructions__row-left">
        <div class="dataset-instructions__title">
          Dataset Instructions
        </div>
      </div>
      <div class="dataset-instructions__row-right">
        <div
          v-if="isV2Dataset"
          class="dataset-instructions__title"
        >
          Dataset Classes
          <custom-button
            v-if="datasetClasses.length > 0"
            class="dataset-instructions__add-class-button"
            color="primary"
            flair="rounded"
            @click="onCreateClass"
          >
            <circle-plus-icon />
            <span>Create new class</span>
          </custom-button>
        </div>
        <div
          v-else
          class="dataset-instructions__title"
        >
          Dataset Classes
          <primary-button
            v-if="datasetClasses.length > 0"
            class="dataset-instructions__add-class-button"
            @click="onCreateClass"
          >
            <circle-plus-icon />
            <span>CREATE NEW CLASS</span>
          </primary-button>
        </div>
      </div>
    </div>
    <div class="dataset-instructions__row dataset-instructions__row--description">
      <div class="dataset-instructions__row-left">
        <div
          class="dataset-instructions__description"
        >
          Please add all relevant instructions that the dataset’s annotators
          will need to know to label images accurately.
        </div>
      </div>
      <div class="dataset-instructions__row-right">
        <div
          class="dataset-instructions__description"
        >
          Define what needs to be labelled here, and include any description of
          each class to assist the annotators. You may add more classes later.
        </div>
      </div>
    </div>
    <div class="dataset-instructions__row dataset-instructions__row--content">
      <div class="dataset-instructions__row-left">
        <div
          v-if="froalaLoaded"
          ref="editorCover"
          class="dataset-instructions__editor"
        >
          <froala
            ref="editor"
            v-model="instructions"
            :tag="'textarea'"
            :config="wysiwygConfig"
            style="height: 100%"
          />
        </div>
      </div>
      <div class="dataset-instructions__row-right">
        <div class="dataset-instructions__classes">
          <instruction-no-classes
            v-if="datasetClasses.length === 0"
            class="dataset-instructions__classes-empty"
            :is-v2="isV2Dataset"
            @add="onCreateClass"
          />
          <instruction-classes
            v-else
            class="dataset-instructions__classes-non-empty"
            :dataset="dataset"
            :is-v2="isV2Dataset"
            @edit="onEditClass"
          />
        </div>
      </div>
    </div>
    <div class="dataset-instructions__row dataset-instructions__row--footer">
      <div
        v-if="isV2Dataset"
        class="dataset-instructions__buttons-v2"
      >
        <custom-button
          variant="outline"
          size="large"
          flair="rounded"
          @click="skip"
        >
          Skip
        </custom-button>
        <custom-button
          flair="rounded"
          size="large"
          color="primary"
          @click="saveAndContinue"
        >
          Save & Continue
        </custom-button>
      </div>
      <div
        v-else
        class="dataset-instructions__buttons"
        :class="{'dataset-instructions__buttons--right-end': datasetClasses.length > 0}"
      >
        <secondary-button
          v-if="datasetClasses.length === 0"
          class="dataset-instructions__skip"
          @click="skip"
        >
          Skip
        </secondary-button>
        <positive-button
          class="dataset-instructions__continue"
          @click="saveAndContinue"
        >
          Save & Continue
        </positive-button>
      </div>
    </div>
    <annotation-class-dialog
      ref="classDialog"
      :annotation-classes="datasetClasses"
      :dataset="dataset"
      :team="currentTeam"
      @add="addedClass"
      @update="updatedClass"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CirclePlusIcon } from '@/assets/icons/V1'
import AnnotationClassDialog from '@/components/Classes/AnnotationClassDialog/AnnotationClassDialog.vue'
import { CustomButton } from '@/components/Common/Button/V2'
import SvgOverlay from '@/components/Common/SVGOverlay.vue'
import InstructionClasses from '@/components/DatasetCreate/Instructions/InstructionClasses.vue'
import InstructionNoClasses from '@/components/DatasetCreate/Instructions/InstructionNoClasses.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import importFroala from '@/plugins/froala-importer'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import {
  AnnotationClassPayload,
  Dataset,
  DatasetPayload,
  RootState,
  StoreActionPayload,
  TeamPayload
} from '@/store/types'
import { ParsedError, getDatasetClasses } from '@/utils'
import {
  FroalaEditor,
  getEditorConfig,
  uploadFiles
} from '@/views/datasets/utils/instructionsEditor'

@Component({
  name: 'Instructions',
  components: {
    AnnotationClassDialog,
    CirclePlusIcon,
    CustomButton,
    InstructionNoClasses,
    InstructionClasses,
    SvgOverlay
  },
  mixins: [BreadCrumbInitializer]
})
export default class Instructions extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  instructions: string = ''
  wysiwygConfig: Object = getEditorConfig(this)

  froalaLoaded: boolean = false

  $refs!: Vue['$refs'] & {
    classDialog: AnnotationClassDialog
  }

  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/datasets', name: 'Datasets' },
      { to: `/datasets/create/${this.dataset.id}/instructions`, name: 'Dataset Creation' }
    ]
  }

  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  get datasetClasses (): AnnotationClassPayload[] {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get isV2Dataset (): boolean {
    return this.dataset.version === 2
  }

  created (): void {
    if (!(this.$options.components && this.$options.components.froala)) {
      importFroala().then(() => {
        this.froalaLoaded = true
      })
    } else {
      this.froalaLoaded = true
    }
  }

  onCreateClass (): void {
    this.openClassDialog()
  }

  onEditClass (selectedClass: AnnotationClassPayload): void {
    this.openClassDialog(selectedClass)
  }

  openClassDialog (annotationClass?: AnnotationClassPayload): void {
    this.$refs.classDialog.show(annotationClass)
  }

  addedClass (params: { data?: AnnotationClassPayload, error?: ParsedError }): void {
    const { error } = params
    if (error) {
      this.$ga.event('create_dataset', 'add_class', 'failure_request_failed', error.error.message)
      return
    }

    this.$ga.event('create_dataset', 'add_class', 'success')
  }

  updatedClass (params: { data?: AnnotationClassPayload, error?: ParsedError }): void {
    const { error } = params
    if (error) {
      this.$ga.event(
        'create_dataset',
        'update_class',
        'failure_request_failed',
        error.error.message
      )
      return
    }

    this.$ga.event('create_dataset', 'update_class', 'success')
  }

  skip (): void {
    this.$ga.event('create_dataset', 'skip_step_3')
    this.onContinue()
  }

  async saveAndContinue (): Promise<void> {
    const { dataset, instructions } = this
    const payload: StoreActionPayload<typeof updateDataset> = {
      dataset,
      params: { instructions }
    }

    await this.$store.dispatch('dataset/updateDataset', payload)
    this.$ga.event('create_dataset', 'continue_step_3', 'success')

    this.onContinue()
  }

  onContinue (): void {
    const params = { datasetId: this.dataset.id.toString() }
    this.$router.push({
      name: this.dataset.version === 2
        ? 'DatasetCreationWorkflowStep'
        : 'DatasetCreationAnnotatorsStep',
      params
    })
  }

  async uploadFiles (files: File[], editor: FroalaEditor): Promise<void> {
    if (!this.currentDataset.id) { return }
    const params = { datasetId: this.currentDataset.id, gaCategory: 'update_dataset' }
    await uploadFiles(this, files, editor, params)
  }
}
</script>

<style lang="scss" scoped>
.dataset-create__v2 {
  background-color: $colorNeutralsWhite;
  @include typography(xl-2, inter, 500);

  .dataset-instructions__title {
    @include typography(xl-2, inter, 500);
    margin-bottom: 24px;
  }
  .dataset-instructions__description {
    @include typography(md-2, inter);
  }

  .dataset-instructions__buttons-v2 {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.dataset-create__box--instructions {
  @include col;
  padding: 40px;
  overflow: hidden;
}

.dataset-instructions__row {
  @include row;
  width: 100%;
}
.dataset-instructions__row-left {
  @include col;
  width: 50%;
  height: 100%;
  padding: 0 30px 0 0;
  position: relative;
}
.dataset-instructions__row-right {
  @include col;
  width: 50%;
  padding: 0 0 0 30px;
}

.dataset-instructions__row--title {
  margin: 0 0 10px 0;
}

.dataset-instructions__title {
  @include typography(xl, default, bold);
  line-height: 26px;
  color: $colorSecondaryDark1;
}

.dataset-instructions__row-right {
  .dataset-instructions__title {
    @include row--distributed;
  }
}

.dataset-instructions__row--description {
  margin-bottom: 15px;
}

.dataset-instructions__description {
  min-height: 36px;
  @include typography(md-1, default);
  color: $colorGrayLite;
  margin: 0;
}

.dataset-instructions__row--content {
  flex: 1;
  margin: 0;
  overflow: hidden;
}

.dataset-instructions__row--footer {
  width: 50%;
  align-self: flex-end;
  align-items: center;
  padding-left: 30px;
  justify-content: flex-end;
}

.dataset-instructions__editor {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 8px;
  right: 0;
  @include typography(lg);

  :deep(.custom-theme.fr-box) {
    height: 100%;
    @include col;
    overflow: hidden;

    &.fr-basic .fr-element {
      height: 100%;
    }
  }
}

.dataset-instructions__add-class-button {
  padding: 9px 20px;
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
    margin-right: 5px;
    color: white;
  }
}

.dataset-instructions__classes {
  flex: 1;
  margin: 0 0 0 0;
  padding: 0 0 10px 0;
  @include col;
}

.dataset-instructions__classes-empty {
  flex: 1;
}

.dataset-instructions__classes-non-empty {
  flex: 1;
  border-radius: $border-radius-default;
  overflow: hidden;
}

.dataset-instructions__buttons {
  @include row--distributed;
  width: 100%;
}

.dataset-instructions__buttons--right-end {
  justify-content: flex-end;
}

button {
  width: calc(50% - 15px);

  &.dataset-instructions__skip {
    margin-right: 10px;
  }
  &.dataset-instructions__continue {
    margin-left: 10px;
  }
}
</style>
