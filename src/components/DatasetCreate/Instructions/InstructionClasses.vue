<template>
  <div
    class="instruction-classes"
    :class="{ 'instruction-classes__v2': isV2 }"
  >
    <div class="instruction-classes__header">
      <div>Image</div>
      <div>Name</div>
      <div>Type</div>
    </div>
    <div class="instruction-classes__list">
      <instruction-class
        v-for="(pclass) in datasetClasses"
        :key="pclass.id"
        class="instruction-classes__list-item"
        :data="pclass"
        @edit="$emit('edit', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { AnnotationClassPayload, DatasetPayload, RootState } from '@/store/types'
import { getDatasetClasses } from '@/utils'

import InstructionClass from './InstructionClass.vue'

@Component({
  name: 'instruction-classes',
  components: { InstructionClass }
})
export default class InstructionClasses extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @Prop({ required: false, type: Boolean, default: false })
  isV2?: boolean

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  get datasetClasses () {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }
}
</script>

<style lang="scss" scoped>
.instruction-classes {
  @include col;
  width: 100%;
  overflow: hidden;

  &__v2 {
    .instruction-classes__header {
      @include typography(md, inter);
    }

    :deep(.instruction-class__name) {
      @include typography(md-1, inter, bold);
    }
  }
}

.instruction-classes__header {
  @include row--center;
  width: 100%;
  height: 38px;
  border-radius: 10px 10px 0 0;
  padding: 0 15px;
  margin-top: 2px;
  @include typography(md, default);
  color: $colorGrayLite;
  background: $colorGriteDark2;
}

.instruction-classes__list {
  @include col;
  width: 100%;
  height: calc(100% - 5px);
  overflow-y: auto;
  background: $colorGriteDark;
  border-radius: 0 0 10px 10px;
}

.instruction-classes__list-item {
  height: 50px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.instruction-classes__header,
.instruction-classes__list-item {
  > *:first-child {
    width: 40px;
    margin: 5px 20px 5px 0;
  }

  > *:nth-child(2) {
    flex: 5;
    margin: 5px 0;
  }

  > *:nth-child(3) {
    flex: 6;
    margin: 5px 0;
  }
}
</style>
