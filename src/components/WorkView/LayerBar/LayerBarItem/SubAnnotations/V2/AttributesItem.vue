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
import { defineComponent, computed, ref } from 'vue'

import AttributesInput from '@/components/WorkView/Common/AttributesInput/V2/AttributesInput.vue'
import { useStore } from '@/composables'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { Annotation } from '@/engineV2/models'
import { Attributes } from '@/engineV2/plugins/attributes/types'
import { getTagsFromAnnotation } from '@/engineV2/plugins/attributes/utils'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload, AttributePayload, InputTag } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

export default defineComponent({
  name: 'AttributesItem',
  components: {
    SubAnnotationItem,
    AttributesInput
  },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    annotationClass: { required: true, type: Object as () => AnnotationClassPayload },
    data: { required: false, default: null, type: Object as () => Attributes | null },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()

    const { getters } = useStore()

    const attributesByAnnotationClassId = computed((): {
      [classId: string]: AttributePayload[]
    } => getters['aclass/attributesByAnnotationClassId'])

    const input = ref<AttributesInput>()

    const editorAnnotation = computed((): Annotation | undefined => {
      return activeView.value.annotationManager.getAnnotation(props.annotation.id)
    })

    const tags = computed((): InputTag[] => {
      return getTagsFromAnnotation(editorAnnotation.value as Annotation, editor.value)
    })

    const allAttributes = computed((): AttributePayload[] => {
      return attributesByAnnotationClassId.value[props.annotationClass.id]
    })

    const activeAttributes = computed((): AttributePayload[] => {
      if (!props.data) { return [] }

      const attributes = props.data.attributes || []
      if (!allAttributes.value) { return [] }
      return allAttributes.value.filter(attr => attr.id && attributes.includes(attr.id))
    })

    const color = computed((): string => {
      return props.annotationClass.metadata._color
    })

    const onClick = (): void => {
      if (!editorAnnotation.value) { return }

      if (editorAnnotation.value.type === 'tag') {
        input.value?.setInputFocus()
      } else {
        editor.value.toolManager.activateTool(
          'attributes_tool',
          { sub: { master: editorAnnotation.value } }
        )
      }
    }

    return {
      editor,
      input,
      color,
      editorAnnotation,
      tags,
      activeAttributes,
      onClick
    }
  }
})
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
