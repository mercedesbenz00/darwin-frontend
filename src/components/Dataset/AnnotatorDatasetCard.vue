<template>
  <div class="annotator-dataset-card">
    <div class="annotator-dataset-card__upside">
      <annotator-type-tag
        v-for="(annotatorType, index) in annotatorTypes"
        :key="annotatorType.id"
        class="annotator-dataset-card__upside__type-icon"
        :style="{top: `${10 + 40 * index}px`}"
        :annotator-type="annotatorType"
      />
      <div
        v-if="thumbnails.length > 0"
        class="annotator-dataset-card__upside__rows"
      >
        <div v-if="thumbnails.length == 1">
          <img v-lazy="thumbnails[0]">
        </div>
        <div v-else>
          <div class="annotator-dataset-card__upside__row annotator-dataset-card__upside__row--top">
            <div
              v-for="i in range(thumbnailsPerRow)"
              :key="`thumbnail-${i}`"
              class="annotator-dataset-card__img"
            >
              <img
                v-if="thumbnails[i]"
                v-lazy="thumbnails[i]"
              >
            </div>
          </div>
          <div class="annotator-dataset-card__upside__row">
            <div
              v-for="i in range(thumbnailsPerRow)"
              :key="`thumbnail-${thumbnailsPerRow + i}`"
              class="annotator-dataset-card__img"
            >
              <img
                v-if="thumbnails[thumbnailsPerRow + i]"
                v-lazy="thumbnails[thumbnailsPerRow + i]"
              >
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="annotator-dataset-card__upside__rows"
      >
        <img
          src="/static/imgs/no_work.svg"
          class="annotator-dataset-card__upside__rows__placeholder"
        >
      </div>
      <div
        v-if="dataset.public"
        class="annotator-dataset-card__status"
      >
        <img
          src="/static/imgs/dataset-status-open.svg"
          class="annotator-dataset-card__status-icon"
        >
        <div class="annotator-dataset-card__status-text">
          Open
        </div>
      </div>
    </div>
    <div class="annotator-dataset-card__downside">
      <div class="annotator-dataset-card__name">
        {{ dataset.name }}
      </div>
    </div>
    <div class="annotator-dataset-card__buttons">
      <div
        @mouseenter="hoveringOverAssignedButton = true"
        @mouseleave="hoveringOverAssignedButton = false"
        @click="onClick"
      >
        <primary-button
          class="button__assigned"
          :disabled="datasetItems.length === 0"
          @mouseenter="hoveringOverAssignedButton = true"
          @mouseleave="hoveringOverAssignedButton = false"
          @click="onClick"
        >
          {{ assignedButtonText }}
        </primary-button>
      </div>
      <div
        v-tooltip="{
          content: 'You can add work once you complete what is assigned to you',
          show: hoveringOverRequestWorkButton && datasetItems.length > 0,
          trigger: 'manual',
        }"
        @mouseenter="hoveringOverRequestWorkButton = true"
        @mouseleave="hoveringOverRequestWorkButton = false"
      >
        <primary-button
          v-tooltip="'Add more work by assigning it to yourself'"
          class="button__request-work"
          :disabled="requestingWork || datasetItems.length > 0"
          @click="requestWork"
        >
          +{{ dataset.work_size }}
        </primary-button>
      </div>
    </div>
    <div class="annotator-dataset-card__instruction-button">
      <positive-button @click="openInstructions">
        Instructions
      </positive-button>
    </div>
    <modal
      class="modal__instructions"
      :name="instructionsModal"
      :adaptive="true"
      :height="'80%'"
      :max-height="800"
      :min-height="400"
    >
      <div class="modal__header">
        <button
          class="modal__close-button"
          aria-label="close"
          @click="closeInstructions"
        />
        <strong>{{ dataset.name }}</strong>
        <p>Annotation instructions</p>
      </div>
      <div class="instructions-scroll-container">
        <instructions
          :annotation-classes="datasetClasses"
          :dataset="dataset"
          in-modal
        />
      </div>
    </modal>
  </div>
</template>

<script lang = "ts">
import { range } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SvgOverlay from '@/components/Common/SVGOverlay.vue'
import Instructions from '@/components/WorkView/Instructions/Instructions.vue'
import { resolveThumbnail } from '@/components/WorkView/utils'
import {
  AnnotationClassPayload,
  DatasetPayload,
  DatasetItemPayload,
  RootState
} from '@/store/types'
import { getDatasetClasses } from '@/utils'

import AnnotatorTypeTag from './AnnotatorTypeTag.vue'

@Component({
  name: 'annotator-dataset-card',
  components: { AnnotatorTypeTag, Instructions, SvgOverlay }
})
export default class AnnotatorDatasetCard extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State(state => state.annotator.items)
  items!: DatasetItemPayload[]

  hoveringOverAssignedButton: boolean = false
  hoveringOverRequestWorkButton: boolean = false

  get datasetClasses (): AnnotationClassPayload[] {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  mounted (): void {
    this.loadDatasetItems()
  }

  async loadDatasetItems (): Promise<void> {
    const { error } = await this.$store.dispatch('annotator/loadDatasetItems', this.dataset)
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  get datasetItems () {
    return this.items.filter(item => item.dataset_id === this.dataset.id)
  }

  get thumbnails () {
    return this.datasetItems.map(item => resolveThumbnail(item))
  }

  get annotatorTypes () {
    const typeOptions = []
    for (const annotatorType of ['annotate', 'review']) {
      if (this.datasetItems.find(item => item.status === annotatorType)) {
        const typeOption = this.annotatorTypeOptions.find(option => option.id === annotatorType)
        typeOptions.push(typeOption)
      }
    }

    return typeOptions
  }

  get annotatorTypeOptions () {
    const icons: {[id: string]: string} = {
      annotate: '/static/imgs/image-status/annotate.svg',
      review: '/static/imgs/image-status/review.svg'
    }
    const labels: {[id: string]: string} = {
      annotate: 'ANNOTATOR',
      review: 'REVIEWER'
    }
    return ['annotate', 'review'].map(key => ({
      id: key,
      label: labels[key],
      icon: icons[key]
    }))
  }

  get firstItem () {
    return this.datasetItems.find(item => (
      item.dataset_image_id ||
      (
        item.dataset_video &&
        item.dataset_video.annotate_as_video
      )
    ))
  }

  onClick () {
    const { dataset, firstItem } = this
    if (!firstItem) { return }

    this.$router.push(`/workview?dataset=${dataset.id}`)
  }

  get instructionsModal () {
    return `instructions-${this.dataset.id}`
  }

  async loadDataset () {
    const { error } = await this.$store.dispatch('annotator/loadDataset', this.dataset)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  requestingWork: boolean = false

  async requestWork () {
    this.requestingWork = true
    const { data, error } = await this.$store.dispatch('annotator/requestWork', this.dataset)
    this.requestingWork = false

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    if (data.length === 0) {
      this.$store.dispatch('toast/notify', {
        content: `No more work to be done for dataset ${this.dataset.name}`
      })
    }
  }

  get assignedButtonText () {
    return this.hoveringOverAssignedButton && this.datasetItems.length > 0
      ? 'START'
      : `${this.datasetItems.length} ASSIGNED TO YOU`
  }

  async openInstructions () {
    if (!this.dataset.instructions) { await this.loadDataset() }
    this.$store.dispatch('ui/putBackSidebar')
    this.$modal.show(this.instructionsModal)
  }

  closeInstructions () {
    this.$store.dispatch('ui/bringFrontSidebar')
    this.$modal.hide(this.instructionsModal)
  }

  get thumbnailWidth () {
    if (this.thumbnails.length < 4) {
      return 100
    } else if (this.thumbnails.length < 6) {
      return 50
    }
    return 25
  }

  get thumbnailsPerRow () {
    if (this.thumbnails.length < 4) {
      return 1
    } else if (this.thumbnails.length < 6) {
      return 2
    }
    return 3
  }

  range (number: number) {
    return range(number)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--annotator-dataset-card {
  &[x-placement^="top"] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.annotator-dataset-card {
  height: 360px;
  min-width: 300px;
  max-width: 300px;
  border-radius: $border-radius-default;
  background-color: $colorSecondaryLight2;
  position: relative;
  display: inline-block;
}

.annotator-dataset-card__upside__type-icon {
  position: absolute;
  left: 10px;
}

.annotator-dataset-card__upside {
  width: 100%;
  height: 180px;
  border-radius: $border-radius-default $border-radius-default 0 0;
  position: relative;
}

.annotator-dataset-card__upside__rows,
.annotator-dataset-card__upside__rows__placeholder,
.annotator-dataset-card__upside__rows div {
  width: 100%;
  height: 100%;
}

.annotator-dataset-card__upside__rows div .annotator-dataset-card__upside__row {
  height: 50%;
}

.annotator-dataset-card__upside__row {
  width: 100%;
  @include row;
}

.annotator-dataset-card__upside__row--top {
  border-radius: $border-radius-default $border-radius-default 0 0;
  overflow: hidden;
}

.annotator-dataset-card__img {
  flex: 1 1 auto;
  height: 100%;
}

.annotator-dataset-card__upside__rows div {
  width: 100%;
  height: 100%;
  object-fit: cover;

  img {
    border-radius: $border-radius-default $border-radius-default 0 0;
  }
}

.annotator-dataset-card__upside__row .annotator-dataset-card__img img {
  border-radius: 0;
}

.annotator-dataset-card__status {
  position: absolute;
  left: 0; bottom: 0;
  @include row--center;
  background: $colorWhite;
  border-radius: 0 2px 0 0;
  width: 90px;
  height: 28px;
  z-index: 999;
}

.annotator-dataset-card__status-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.annotator-dataset-card__status-text {
  margin-left: 10px;
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryLight;
}

.annotator-dataset-card__downside {
  background-color: $colorSecondaryLight2;
  margin-top: 10px;
  padding: 5px 20px;
  position: relative;
}

.annotator-dataset-card__buttons {
  @include row--distributed;
  background-color: $colorSecondaryLight2;
  padding: 5px 15px;
  margin-bottom: 5px;
}

.annotator-dataset-card__buttons button {
  border-radius: 2px;
}

.button__assigned {
  width: 205px;
  font-weight: 700;
}

.button__request-work {
  width: 50px;
  padding: 0px 10px !important;
  font-weight: 700;
}

.annotator-dataset-card__instruction-button {
  @include row--distributed;
  padding: 5px 15px;
}

.annotator-dataset-card__instruction-button button {
  width: 100%;
  border-radius: 2px;
  font-weight: 700;
}

.annotator-dataset-card__instruction-button button:hover {
  width: 100%;
  border-radius: 2px;
}

.annotator-dataset-card__name {
  @include ellipsis(2, lg, 22px);
  @include typography(md-1, default, bold);
  min-height: 45px;
  max-height: 45px;
  white-space: wrap;
  color: $colorSecondaryDark;
  margin: 0 35px 0 0;
}

.annotator-dataset__header__instructions {
  @include typography(md-1, headlines, 500);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin: 0 10px 0 0;
  color: $colorSecondaryDark1;
  @include row--center;
  cursor: pointer;
  user-select: none;
}
</style>
