<template>
  <v-popover
    class="class-item-wrapper"
    trigger="hover"
  >
    <type-icon-with-label
      class="class-item"
      :color="annotationClass.metadata._color"
      :label="annotationClass.name"
      :type="mainType.name"
    />
    <template #popover>
      {{ mainTypeName }}
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'
import { formatTypeName } from '@/utils'

@Component({ name: 'class-item', components: { TypeIconWithLabel } })
export default class ClassItem extends Vue {
  @Prop({ required: true, type: Object as () => AnnotationClassPayload })
  annotationClass!: AnnotationClassPayload

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  get mainType (): AnnotationTypePayload {
    return this.getMainAnnotationType(this.annotationClass)
  }

  get mainTypeName (): string {
    return formatTypeName(this.mainType.name)
  }
}
</script>
<style lang="scss" scoped>
.class-item-wrapper {
  display: grid;
  justify-content: stretch;

  :deep(.trigger) {
    display: grid;
    justify-content: stretch;
  }
}
</style>
