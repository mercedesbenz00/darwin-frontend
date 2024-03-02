<template>
  <div
    class="class-card"
    :class="{
      'class-card--selected': selected
    }"
    @click="onCardClick"
  >
    <div class="class-card__thumbnail">
      <img
        v-if="image"
        :key="image"
        v-lazy="image"
        class="class-card__thumbnail__img"
      >
      <div
        v-else
        class="class-card__thumbnail__initials"
        :style="{ background: annotationClass.metadata._color }"
      >
        {{ annotationClass.name }}
      </div>
      <transition name="fade">
        <class-card-overlay
          class="class-card__overlay"
          :annotation-class="annotationClass"
          :dataset="dataset"
          :is-non-dataset="isNonDataset"
          :selected.sync="_selected"
          @add-to-dataset="$emit('add-to-dataset')"
          @remove-from-dataset="$emit('remove-from-dataset')"
          @edit="$emit('edit')"
          @delete="$emit('delete')"
        />
      </transition>
    </div>
    <div class="class-card__details">
      <div class="class-card__annotation__main_types">
        <div class="class-card__annotation__types">
          <type-icon
            v-for="type of visibleMainAnnotationTypes"
            :key="type"
            class="class-card__annotation__type__svg"
            :color="annotationClass.metadata._color"
            :type="type"
          />
        </div>
        <div class="class-card__details__name">
          {{ annotationClass.name }}
        </div>
        <class-card-hotkey-display
          v-if="!isNonDataset"
          class="class-card__details__hotkey"
          :annotation-class="annotationClass"
          :dataset="dataset"
        />
      </div>
      <div class="class-card__annotation__types">
        <type-icon
          v-for="type of visibleSubAnnotationTypes"
          :key="type"
          class="class-card__annotation__type__svg"
          :color="annotationClass.metadata._color"
          :type="type"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetPayload
} from '@/store/types'
import { getShortenedName } from '@/utils'

import ClassCardHotkeyDisplay from './ClassCardHotkeyDisplay.vue'
import ClassCardOverlay from './ClassCardOverlay.vue'

@Component({
  name: 'class-card',
  components: { ClassCardHotkeyDisplay, ClassCardOverlay, TypeIcon }
})
export default class ClassCard extends Vue {
  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: false, type: Boolean, default: false })
  selected!: boolean

  @Prop({ required: false, type: Object as () => DatasetPayload, default: null })
  dataset!: DatasetPayload | null

  /**
   * Flag to mark if we are going to disable select or not.
   * - the dataset is given
   * - the annotation class doesn't belong to dataset
   *
   * This means that the annotation class is in the `Other Classes` section
   * of Dataset Management.
   * In this case, we don't support select at the moment.
   */
  get isNonDataset (): boolean {
    const { annotationClass, dataset } = this
    if (!dataset) { return false }
    return !annotationClass.datasets.find(d => d.id === dataset.id)
  }

  get _selected () {
    return this.selected
  }

  set _selected (val: boolean) {
    this.$emit('select', { ...this.annotationClass, selected: val })
  }

  get image () {
    return this.annotationClass.images.find(i => !!i.crop_url)?.crop_url
  }

  get initials () {
    return getShortenedName(this.annotationClass.name)
  }

  @Getter('renderableAnnotationTypesForClass', { namespace: 'aclass' })
  renderableAnnotationTypesForClass!: (aClass: AnnotationClassPayload) => AnnotationTypePayload[]

  get visibleMainAnnotationTypes (): AnnotationTypeName[] {
    return this.renderableAnnotationTypesForClass(this.annotationClass)
      .filter(t => t.granularity === 'main')
      .map(t => t.name)
  }

  get visibleSubAnnotationTypes (): AnnotationTypeName[] {
    return this.renderableAnnotationTypesForClass(this.annotationClass)
      .filter(t => t.granularity === 'sub')
      .map(t => t.name)
  }

  onCardClick (evt: MouseEvent) {
    if (this.isNonDataset) { return }
    if (evt.shiftKey) {
      this.$emit('shift-select', {
        ...this.annotationClass,
        selected: true
      })
    } else {
      this._selected = !this._selected
    }
    evt.stopPropagation()
    evt.preventDefault()
  }
}
</script>

<style lang="scss" scoped>
.class-card {
  @include noSelect;
  min-width: 150px;
  min-height: 150px;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  @include col;
  position: relative;
  cursor: pointer;

  &:hover {
    .class-card__thumbnail {
      box-shadow: 0px 5px 40px rgba(11, 36, 72, 0.2);
    }

    .class-card__overlay {
      visibility: visible;
    }
  }

  &:not(:hover) {
    .class-card__overlay {
      visibility: hidden;
    }
  }

  &.class-card--selected {
    .class-card__overlay {
      visibility: visible;
    }
  }
}

.class-card__thumbnail {
  flex: 1 1 auto;
  display: flex;
  position: relative;
  border-radius: 5px;
}

.class-card__thumbnail__img {
  position: absolute;
  @include fullsize;
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
}

.class-card__thumbnail__images.class-card__thumbnail__images--four img {
  width: 50%;
}

.class-card__thumbnail__initials {
  position: absolute;
  @include fullsize;
  @include row--center;
  @include typography(xxl-1, default, bold);
  color: white;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
}

.class-card__annotation__main_types {
  @include row;
}

.class-card__annotation__types {
  @include row;
  min-width: 20px;
  border-radius: 20px;
  padding: 0 5px;
  right: 5px;
  bottom: 10px;
  color: $color90Black;
  @include typography(sm, headlines, bold);
  letter-spacing: 0.03em;
  z-index: 1;
}

.class-card__annotation__type__svg {
  width: 23px;
  height: 23px;
}

.class-card__details {
  width: 100%;
  height: 60px;
  @include col;
  padding: 6px 0;
}

.class-card__details__name {
  flex: 1;
  display: flex;
  align-items: center;
  @include ellipsis(1);
  @include typography(md-1, headlines, 500);
  letter-spacing: 0.02em;
  text-align: left;
  color: $color90Black;
}
</style>
