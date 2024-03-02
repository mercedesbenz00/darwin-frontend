<template>
  <annotation-class-section
    title="Description"
    optional
  >
    <div class="annotation-input__textarea">
      <text-area
        id="classDescription"
        type="text"
        name="classDescription"
        :value="description"
        @input="$emit('update:description', $event)"
      />
    </div>
  </annotation-class-section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TextArea from '@/components/Common/TextArea.vue'

import AnnotationClassSection from './Common/AnnotationClassSection.vue'

@Component({
  name: 'description',
  components: { AnnotationClassSection, TextArea }
})
export default class Description extends Vue {
  @Prop({ required: true })
  description!: string
}
</script>

<style lang="scss" scoped>
.annotation-input__textarea {
  width: 100%;
  height: 100px;
  padding: 0;
  margin: 16px 0 0 0;

  :deep(.text-area__input) {
    background: $colorAliceShade;
    border-radius: $border-radius-default;
  }
}
</style>
