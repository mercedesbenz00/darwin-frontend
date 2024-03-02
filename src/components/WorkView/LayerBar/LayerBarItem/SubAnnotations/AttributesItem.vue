<template>
  <v-popover
    v-if="editorAnnotation"
    :disabled="editorAnnotation.type !== 'tag'"
    popover-class="attributes-item__popover"
  >
    <sub-annotation-item
      v-if="editorAnnotation && (!readonly || activeAttributes.length > 0)"
      class="attributes-item"
      :annotation-class="annotationClass"
      :readonly="readonly"
      type="attributes"
      @click="onClick"
    >
      <div
        v-if="activeAttributes.length > 0"
        class="attributes-item__attributes"
      >
        <div
          v-for="(attribute, index) of activeAttributes"
          :key="index"
          class="attributes-item__attribute"
          :style="{ background: attribute.color }"
        >
          {{ attribute.name }}
        </div>
      </div>

      <div
        v-else
        class="attributes-item__placeholder"
      >
        Click to add Attributes
      </div>
    </sub-annotation-item>
    <template #popover>
      <attributes-input
        ref="input"
        :editor="editor"
        :master-annotation="editorAnnotation"
        :tags="tags"
      />
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import AttributesInput from '@/components/WorkView/Common/AttributesInput/AttributesInput.vue'
import { Editor } from '@/engine/editor'
import { Attributes } from '@/engine/plugins/attributes/types'
import { getTagsFromAnnotation } from '@/engine/plugins/attributes/utils'
import { StageAnnotation } from '@/store/modules/workview/types'
import { Annotation, AnnotationClassPayload, AttributePayload, InputTag } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

@Component({
  name: 'attributes-item',
  components: {
    SubAnnotationItem,
    AttributesInput
  }
})
export default class AttributesItem extends Vue {
  @Prop({ required: true })
  annotation!: StageAnnotation

  @Prop({ required: true })
  annotationClass!: AnnotationClassPayload

  @Prop({ required: false, default: null })
  data!: Attributes | null

  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @Getter('attributesByAnnotationClassId', { namespace: 'aclass' })
  attributesByAnnotationClassId!: {
    [classId: string]: AttributePayload[]
  }

  $refs!: Vue['$refs'] & {
    input: InstanceType<typeof AttributesInput>
  }

  get tags (): InputTag[] {
    return getTagsFromAnnotation(this.editorAnnotation as Annotation, this.editor)
  }

  get allAttributes (): AttributePayload[] {
    return this.attributesByAnnotationClassId[this.annotationClass.id]
  }

  get activeAttributes (): AttributePayload[] {
    if (!this.data) { return [] }

    const attributes = this.data.attributes || []
    if (!this.allAttributes) { return [] }
    return this.allAttributes.filter(attr => attr.id && attributes.includes(attr.id))
  }

  get color (): string {
    return this.annotationClass.metadata._color
  }

  get editorAnnotation (): Annotation | undefined {
    return this.editor.activeView.annotations.find(a => a.id === this.annotation.id)
  }

  onClick (): void {
    const { editorAnnotation } = this
    if (!editorAnnotation) { return }

    if (editorAnnotation.type === 'tag') {
      this.$refs.input.setInputFocus()
    } else {
      this.editor.activateTool('attributes_tool', { sub: { master: editorAnnotation } })
    }
  }
}
</script>

<style lang="scss" scoped>
.attributes-item__attributes {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
}

.attributes-item__attribute {
  @include row;
  align-items: center;

  width: fit-content;
  max-width: 100%;
  padding: 2px 3px;
  margin: 2px;
  border-radius: $border-radius-default;

  @include typography(sm);
  line-height: 10px;
  color: $color90Black;
}

.attributes-item__placeholder {
  @include row;
  align-items: center;

  padding: 0 3px;

  @include typography(sm);
  color: $colorAliceNight;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.attributes-item__popover {
  .tooltip-inner {
    padding: 0;
    background-color: transparent;
  }
}
</style>
