<template>
  <div
    class="class-listitem"
    :class="{ 'class-listitem__selected': isSelected }"
  >
    <div
      v-if="!isNonDataset"
      class="class-listitem__checkbox"
    >
      <check-box
        :id="`class-listitem-${annotationClass.id}`"
        v-model="isSelected"
        name="class-listitem"
        :chk-value="annotationClass.id"
      />
    </div>
    <div class="class-listitem__thumbnail">
      <img
        v-if="image"
        v-lazy="image"
        class="class-listitem__thumbnail__img"
      >
      <div
        v-else
        class="class-listitem__thumbnail__initials"
        :style="{ background: annotationClass.metadata._color }"
      >
        {{ initials }}
      </div>
    </div>
    <div class="class-listitem__name">
      {{ annotationClass.name }}
    </div>
    <div class="class-listitem__types">
      <type-icon
        v-for="typeName of visibleAnnotationTypes"
        :key="typeName"
        class="class-listitem__type-svg"
        :color="annotationClass.metadata._color"
        :type="typeName"
      />
    </div>
    <class-card-menu
      class="class-listitem__more"
      :is-non-dataset="isNonDataset"
      @add-to-dataset="$emit('add-to-dataset')"
      @remove-from-dataset="$emit('remove-from-dataset')"
      @delete="$emit('delete')"
      @edit="$emit('edit')"
    >
      <more-horizontal-icon />
    </class-card-menu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { MoreHorizontalIcon } from '@/assets/icons/V1'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  AnnotationTypePayload,
  DatasetPayload
} from '@/store/types'
import { getShortenedName } from '@/utils'

import ClassCardMenu from './ClassCardMenu.vue'

@Component({
  name: 'class-list-item',
  components: { CheckBox, ClassCardMenu, MoreHorizontalIcon, TypeIcon }
})
export default class ClassListItem extends Vue {
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

  get isSelected () {
    return this.selected
  }

  set isSelected (val: boolean) {
    this.$emit('select', {
      ...this.annotationClass,
      selected: val
    })
  }

  get image (): string | null {
    return this.annotationClass.images[0]?.crop_url
  }

  get initials () {
    return getShortenedName(this.annotationClass.name)
  }

  @Getter('renderableAnnotationTypesForClass', { namespace: 'aclass' })
  renderableAnnotationTypesForClass!: (aClass: AnnotationClassPayload) => AnnotationTypePayload[]

  get visibleAnnotationTypes (): AnnotationTypeName[] {
    return this.renderableAnnotationTypesForClass(this.annotationClass).map(t => t.name)
  }
}
</script>

<style lang="scss" scoped>
.class-listitem {
  width: 100%;
  min-height: 65px;
  background: transparent;
  @include row--center;
  padding: 10px 0 10px 10px;
  border-bottom: 1px solid $colorSecondaryLight1;
  cursor: pointer;
  position: relative;

  &:hover {
    background: $colorGriteDark;
  }
}

.class-listitem__selected {
  background: $colorGriteDark;
}

.class-listitem__checkbox {
  width: 16px;
  margin-right: 10px;
}

.class-listitem__thumbnail {
  width: 45px;
  height: 45px;
  border-radius: 5px;
  margin-right: 15px;
  overflow: hidden;
  position: relative;
  border-radius: 5px;
}

.class-listitem__thumbnail__img {
  position: absolute;
  @include fullsize;
  object-fit: cover;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.class-listitem__thumbnail__images.class-listitem__thumbnail__images--four img {
  width: 50%;
}

.class-listitem__thumbnail__initials {
  width: 100%;
  height: 100%;
  color: white;
  @include row--center;
}

.class-listitem__name {
  flex: 1;
  @include ellipsis(1);
  @include typography(md-1, default, bold);
  letter-spacing: 0.5px;
  color: $colorSecondaryDark1;
}

.class-listitem__types {
  flex: 1;
  @include row;
  justify-content: flex-start;
  align-items: center;
}

.class-listitem__type-svg {
  width: 23px;
  height: 23px;
}

.class-listitem__more {
  display: flex;
  justify-content: flex-end;
  height: 100%;
  z-index: var(--classes-view-menu);

  svg {
    width: 16px;
    color: $colorAliceNight;
  }
}

.context-menu {
  position: fixed;
  right: 0px;
  z-index: var(--classes-context-menu) !important;
}
</style>
