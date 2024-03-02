<template>
  <sub-annotation-item
    v-if="editorAnnotation"
    class="instance-id-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="instance_id"
  >
    <content-editable
      ref="inputRef"
      v-model="value"
      v-input-auto-blur="true"
      class="instance-id-item__input"
      disable-multiline
      :disabled="readonly"
      placeholder="Click to add instance id"
      type="text"
      @blur.native="onBlur"
      @dblclick.native.stop
      @keydown.native.stop
      @keypress.native.stop="onlyNumber"
      @keyup.native.stop
      @enter="onEnter"
    />
  </sub-annotation-item>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

import ContentEditable from '@/components/Common/ContentEditable.vue'
import { useStore } from '@/composables'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { addOrUpdateSubAnnotation, removeSubAnnotationAction } from '@/engineV2/actions'
import { Annotation } from '@/engineV2/models'
import { InstanceID } from '@/engineV2/plugins/instanceId/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

export default defineComponent({
  name: 'InstanceIdItem',
  components: { ContentEditable, SubAnnotationItem },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    annotationClass: { required: true, type: Object as () => AnnotationClassPayload },
    data: { required: false, default: null, type: Object as () => Partial<InstanceID> | null },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()

    const { dispatch } = useStore()

    const inputRef = ref<ContentEditable>()
    const value = ref('')

    const editorAnnotation = computed((): Annotation | undefined => {
      return activeView.value.annotationManager.getAnnotation(props.annotation.id)
    })

    const blur = (): void => {
      if (!inputRef.value) { return }
      inputRef.value.blur()
    }

    const onBlur = (): void => {
      value.value = props.data?.value ? props.data?.value.toString() : ''
    }

    watch(() => props.data, () => {
      onBlur()
    }, { immediate: true })

    const onlyNumber = (event: KeyboardEvent): void => {
      const keyCode = (event.keyCode ? event.keyCode : event.which)
      if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 13 && keyCode !== 8) {
        dispatch('toast/notify', {
          content: 'The instance ID is a numeric value. Please only use numbers'
        })
        event.preventDefault()
      }
    }

    const save = async (): Promise<void> => {
      if (!editorAnnotation.value) { return }

      // If it's trying to save the same value, no need to save again.
      if (props.data?.value && value.value === props.data.value.toString()) { return }

      if (value.value === '') {
        await editor.value.actionManager.do(
          removeSubAnnotationAction(editor.value.activeView, 'instance_id', editorAnnotation.value)
        )
      } else {
        const annotation = activeView.value.annotationManager.initializeSubAnnotation(
          'instance_id',
          editorAnnotation.value,
          { value: parseInt(value.value) }
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
      value,
      inputRef,
      editorAnnotation,
      onlyNumber,
      onEnter,
      onBlur
    }
  }
})
</script>

<style lang="scss" scoped>
.instance-id-item {
  overflow: hidden;
}

.instance-id-item__input {
  width: 100%;
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
