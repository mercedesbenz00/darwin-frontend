<template>
  <div class="instruction-class">
    <div class="instruction-class__image">
      <img
        v-if="image"
        v-lazy="image"
      >
      <div
        v-else
        class="instruction-class__image__initials"
        :style="{ background: data.metadata._color }"
      >
        {{ initials }}
      </div>
    </div>
    <div class="instruction-class__name">
      {{ data.name }}
    </div>
    <div class="instruction-class__type">
      <div class="instruction-class__type__types">
        <type-icon
          v-for="type in typeIconNames"
          :key="type"
          class="instruction-class__type__type"
          :color="data.metadata._color"
          :type="type"
        />
      </div>
      <div
        class="instruction-class__type__pencil"
        @click="editClass"
      >
        <img src="/static/imgs/pencil-gray-icon.svg">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import { AnnotationClassPayload, AnnotationTypeName, AnnotationTypePayload } from '@/store/types'
import { getShortenedName } from '@/utils'

@Component({
  name: 'instruction-class',
  components: { TypeIcon }
})
export default class InstructionClass extends Vue {
  @Getter('renderableAnnotationTypesForClass', { namespace: 'aclass' })
  renderableAnnotationTypesForClass!: (aClass: AnnotationClassPayload) => AnnotationTypePayload[]

  @Prop({ required: true })
  data!: AnnotationClassPayload

  get typeIconNames (): AnnotationTypeName[] {
    return this.renderableAnnotationTypesForClass(this.data).map(t => t.name)
  }

  get image () {
    return this.data.images[0]?.crop_url
  }

  get initials () {
    return getShortenedName(this.data.name)
  }

  editClass () {
    this.$emit('edit', this.data)
  }
}
</script>

<style lang="scss" scoped>
.instruction-class {
  @include row--center;
  padding: 5px 15px;
  border-bottom: 1px solid $colorGriteDark2;
}

.instruction-class__image {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.instruction-class__image__initials {
  width: 100%;
  height: 100%;
  @include row--center;
  @include typography(lg, default, bold);
  color: white;
}

.instruction-class__name {
  @include typography(md-1, default, bold);
  color: $colorSecondaryDark1;
}

.instruction-class__type {
  @include row--distributed--center;
}

.instruction-class__type__types {
  @include row;
  justify-content: flex-start;
  align-items: center;
}

.instruction-class__type__type {
  width: 20px;
  height: 20px;
  margin: 0 5px 0 0;
}

.instruction-class__type__pencil {
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}
</style>
