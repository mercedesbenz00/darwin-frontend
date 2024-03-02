<template>
  <div class="webhook-sidebar-child">
    <div class="webhook-sidebar-child__container">
      <TextInput
        :value="url"
        :error="error"
        label="URL"
        placeholder="Insert a valid url"
        autofocus
        required
        @blur="onUrlBlur"
        @change="onUrlChange"
      />
      <TextInput
        :value="authorizationHeader"
        label="Authorization"
        placeholder="Insert an authorization header"
        optional
        @change="onAuthorizationHeaderChange"
      />
      <div class="webhook-sidebar-child__container__retry__wrapper">
        <CheckBox
          name="retry_if_fails"
          label="Retry if fails"
          :value="retryIfFails"
          size="large"
          @change="onRetryIfFailsChange"
        />
        <div
          class="webhook-sidebar-child__container__retry__wrapper__icon"
          v-tooltip="retryTooltip"
        >
          <icon-mono-info />
        </div>
      </div>
      <div class="webhook-sidebar-child__container__include-annotations__wrapper">
        <CheckBox
          name="include_annotations"
          label="Include annotation data"
          :value="includeAnnotations"
          size="large"
          @change="onIncludeAnnotationsChange"
        />
        <div
          class="webhook-sidebar-child__container__include-annotations__wrapper__icon"
          v-tooltip="annotationTooltip"
        >
          <icon-mono-info />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue'

import { IconMonoInfo } from '@/assets/icons/V2/Mono'
import CheckBox from '@/components/Common/CheckBox/V2/CheckBox.vue'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { V2WebhookStagePayload } from '@/store/types'
import { TooltipOptions } from '@/types'
import { TextInput } from '@/uiKit/TextInput'
import { validUrl } from '@/utils/regex'

export default defineComponent({
  name: 'WebhookStageSidebarChild',
  components: { CheckBox, TextInput, IconMonoInfo },
  setup () {
    const scene = useWorkflowSceneStore()

    const stage: Ref<V2WebhookStagePayload | null> =
      ref(scene.selectedStage ? scene.selectedStage as V2WebhookStagePayload : null )
    const url: Ref<String> = ref('')
    const authorizationHeader: Ref<String> = ref('')
    const retryIfFails: Ref<Boolean> = ref(false)
    const includeAnnotations: Ref<Boolean> = ref(false)
    const error: Ref<String> = ref('')
    const dirty: Ref<boolean> = ref(false)

    const retryTooltip = computed((): TooltipOptions | undefined => {
      return {
        placement: 'top',
        classes: 'tooltip--retry',
        content: `We will call this API up to 5 times before marking it as failed.
        This is recommended in case the service is busy or temporarily unresponsive.`,
        delay: {
          show: 300,
          hide: 300
        }
      }
    })

    const annotationTooltip = computed((): TooltipOptions | undefined => {
      return {
        placement: 'top',
        classes: 'tooltip--include-annotations',
        content: `Deliver the whole JSON payload of annotations. Turn this off
        if you don’t need annotation data to be transferred as it can take a bit longer.`,
        delay: {
          show: 300,
          hide: 300
        }
      }
    })

    const { updateStageConfig } = useEditedWorkflow()

    const onUrlChange = (val: string): void => {
      url.value = val
      if (!stage.value) { return }

      error.value = ''
      dirty.value = true

      const stageId = stage.value ? stage.value.id : ''
      updateStageConfig({stageId, config: { url: val } })
    }

    const onAuthorizationHeaderChange = (val: string): void => {
      authorizationHeader.value = val
      if (!stage.value) { return }

      const stageId = stage.value ? stage.value.id : ''
      updateStageConfig({ stageId, config: { authorization_header: val } })
    }

    const onUrlBlur = (): void => {
      if (!dirty.value) { return }
      if (!url.value) {
        error.value = 'Url is a required value'
      } else if (!validUrl(`${url.value}`)) {
        error.value = 'Must contain a valid url (eg: https://yourapp.com/data/12345?value=foo)'
      }
    }

    const onRetryIfFailsChange = ({ checked }: { checked: boolean }): void => {
      retryIfFails.value = !!checked
      if (!stage.value) { return }

      const stageId = stage.value ? stage.value.id : ''
      updateStageConfig({ stageId, config: { retry_if_fails: !!checked } })
    }

    const onIncludeAnnotationsChange = ({ checked }: { checked: boolean }): void => {
      includeAnnotations.value = !!checked
      if (!stage.value) { return }

      const stageId = stage.value ? stage.value.id : ''
      updateStageConfig({ stageId, config: { include_annotations: !!checked } })
    }

    const setData = (): void => {
      if (!stage.value) { return }
      const { config } = stage.value
      url.value = config?.url || ''
      authorizationHeader.value = config?.authorization_header || ''
      retryIfFails.value = !!config?.retry_if_fails
      includeAnnotations.value = !!config?.include_annotations
    }

    watch(() => scene.selectedStage, (val: V2WebhookStagePayload) => {
      stage.value = val
      setData()
    }, { deep: true, immediate: true })

    return {
      url,
      authorizationHeader,
      retryIfFails,
      includeAnnotations,
      error,
      dirty,
      retryTooltip,
      annotationTooltip,
      onUrlChange,
      onAuthorizationHeaderChange,
      onUrlBlur,
      onRetryIfFailsChange,
      onIncludeAnnotationsChange
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--retry,
.tooltip--include-annotations {
  .tooltip-inner {
    max-width: 280px;
    background: rgba(31, 31, 31, 0.8);
  }
}
</style>

<style lang='scss' scoped>
.webhook-sidebar-child {
  height: 100%;

  &__container {
    display: grid;
    grid-template-rows: repeat(auto-fit, min-content);
    grid-row-gap: 10px;
    padding: 12px;

    &__retry__wrapper,
    &__include-annotations__wrapper {
      @include row;
      align-items: center;
      gap: 4px;

      &__icon {
        @include row;
        align-items: center;

        &:hover {
          cursor: help;
        }
      }
    }
  }
}
</style>
