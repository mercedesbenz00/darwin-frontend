<template>
  <sub-annotation-item
    v-if="editorAnnotation"
    class="text-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="text"
  >
    <content-editable
      ref="inputRef"
      v-model="value"
      v-input-auto-blur="true"
      class="text-item__input"
      :disabled="readonly"
      disable-multiline
      placeholder="Click to add text"
      type="text"
      @blur.native="onBlur"
      @dblclick.native.stop
      @keydown.native.stop
      @keypress.native.stop
      @keyup.native.stop
      @enter="onEnter"
    />
  </sub-annotation-item>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'

import ContentEditable from '@/components/Common/ContentEditable.vue'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { addOrUpdateSubAnnotation, removeSubAnnotationAction } from '@/engineV2/actions'
import { Annotation } from '@/engineV2/models'
import { Text } from '@/engineV2/plugins/text/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

export default defineComponent({
  name: 'TextItem',
  components: { ContentEditable, SubAnnotationItem },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    annotationClass: { required: true, type: Object as () => AnnotationClassPayload },
    data: { required: false, default: null, type: Object as () => Text | null },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()

    const inputRef = ref<ContentEditable>()
    const value = ref('')

    const editorAnnotation = computed((): Annotation | undefined => {
      return activeView.value.annotationManager.getAnnotation(props.annotation.id)
    })

    const blur = () => {
      if (!inputRef.value) { return }
      inputRef.value.blur()
    }

    watch(() => props.data, () => {
      value.value = props.data?.text || ''
    }, { immediate: true })

    const onBlur = (): void => {
      value.value = props.data?.text || ''
    }

    const save = async (): Promise<void> => {
      if (!editorAnnotation.value) { return }

      if (value.value === '') {
        await editor.value.actionManager.do(
          removeSubAnnotationAction(editor.value.activeView, 'text', editorAnnotation.value)
        )
      } else {
        const annotation =
          activeView.value.annotationManager.initializeSubAnnotation(
            'text',
            editorAnnotation.value,
            { text: value.value }
          )
        if (!annotation) { return }

        await editor.value.actionManager.do(
          addOrUpdateSubAnnotation(editor.value.activeView, annotation, editorAnnotation.value)
        )
      }
    }

    const onEnter = async (): Promise<void> => {
      await save()
      blur()
    }

    return {
      inputRef,
      value,
      onEnter,
      onBlur,
      editorAnnotation
    }
  }
})
</script>

<style lang="scss" scoped>
.text-item {
  overflow: hidden;
}

.text-item__input {
  flex: 1;
  padding: 2px 3px;
  max-height: 200px;
  overflow-x: auto;

  border-radius: $border-radius-default;
  @include typography(sm, default);
  color: $colorBlack;

  &:empty:before {
    color: $colorAliceNight;
  }

  &:hover, &:focus {
    padding: 2px 3px;
    border-radius: $border-radius-default;
  }

  &:focus {
    border: none;
    background: $colorAliceBlue;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  }
}
</style>
