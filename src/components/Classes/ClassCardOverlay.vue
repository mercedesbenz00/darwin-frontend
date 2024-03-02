<template>
  <div class="class-card-overlay">
    <div
      v-if="!isNonDataset"
      class="class-card-overlay__checkbox"
    >
      <check-box
        :id="`class-card-${annotationClass.id}`"
        v-model="_selected"
        name="class-card"
        :chk-value="annotationClass.id"
        size="small"
      />
    </div>
    <div class="class-card-overlay__buttons">
      <template v-if="dataset">
        <div
          v-if="isNonDataset"
          class="class-card-overlay__button"
          @click.stop.prevent="$emit('add-to-dataset')"
        >
          Add
        </div>
        <div
          v-else
          class="class-card-overlay__button"
          @click.stop.prevent="$emit('remove-from-dataset')"
        >
          Remove
        </div>
      </template>
      <div
        class="class-card-overlay__button"
        @click.stop.prevent="$emit('edit')"
      >
        Edit
      </div>
    </div>
    <class-card-menu
      class="class-card-overlay__more"
      :dataset="dataset"
      :is-non-dataset="isNonDataset"
      @add-to-dataset="$emit('add-to-dataset')"
      @remove-from-dataset="$emit('remove-from-dataset')"
      @delete="$emit('delete')"
      @edit="$emit('edit')"
    >
      <img
        class="class-card-overlay__icon"
        src="/static/imgs/more-white-icon.svg"
      >
    </class-card-menu>
    <div class="class-card-overlay__background" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

import ClassCardMenu from './ClassCardMenu.vue'

@Component({
  name: 'class-card-overlay',
  components: { CheckBox, ClassCardMenu }
})
export default class ClassCardOverlay extends Vue {
  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: false, type: Object as () => DatasetPayload, default: null })
  dataset!: DatasetPayload | null

  @Prop({ required: false, type: Boolean, default: false })
  selected!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  isNonDataset!: boolean

  get _selected () {
    return this.selected
  }

  set _selected (val: boolean) {
    this.$emit('update:selected', val)
  }
}
</script>

<style lang="scss" scoped>
.class-card-overlay {
  position: absolute;
  @include fullsize;
  @include row--center;
  border-radius: 5px;
  overflow: hidden;
  opacity: 1;
}

.class-card-overlay__checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: var(--classes-view-menu);;
}

.class-card-overlay__buttons {
  @include col--center;
  row-gap: 10px;
}

.class-card-overlay__button {
  @include row--center;
  width: 90px;
  height: 30px;
  border: 2px solid $colorWhite;
  border-radius: 5px;
  color: $colorWhite;
  @include typography(md-1, headlines, 500);
  text-align: center;
  letter-spacing: 0.5px;
  opacity: 1;
  cursor: pointer;
  z-index: var(--classes-view-menu);;

  &:hover, &:active {
    background: $colorWhite;
    color: $color90Black;
  }
}

.class-card-overlay__more {
  z-index: var(--classes-view-menu);
  position: absolute;
  top: 3px;
  right: 10px;
}

.class-card-overlay__icon {
  width: 100%;
}

.class-card-overlay__background {
  position: absolute;
  @include fullsize;
  background: $color90Black;
  mix-blend-mode: multiply;
  opacity: 0.6;
}
</style>
