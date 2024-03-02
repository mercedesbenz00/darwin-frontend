<template>
  <div>
    <div
      class="readonly"
    >
      <check-box
        name="read_only"
        label="Read-only"
        :value="readOnly"
        size="large"
        @change="onReadOnlyChange"
      />
      <div
        class="readonly__icon"
        v-tooltip="readOnlyTooltip"
      >
        <icon-mono-info />
      </div>
    </div>
    <ConfigurableUserList :stage="stage" />
  </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue'

import { IconMonoInfo } from '@/assets/icons/V2/Mono'
import CheckBox from '@/components/Common/CheckBox/V2/CheckBox.vue'
import ConfigurableUserList from '@/components/Stages/StageChilds/ConfigurableUserList.vue'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'
export default defineComponent({
  name: 'ReviewStageSidebarChild',
  components: {
    CheckBox,
    ConfigurableUserList,
    IconMonoInfo,
  },
  props: {
    stage: { type: Object as () => V2ReviewStagePayload, required: true }
  },
  setup (props) {
    const readOnly = ref(false)

    const readOnlyTooltip =
      'In Read Only reviewers can mark errors, but cannot correct annotations or create new ones'

    const { updateStageConfig } = useEditedWorkflow()

    const onReadOnlyChange = ({ checked }: { checked: boolean }): void => {
      readOnly.value = !!checked
      updateStageConfig({ stageId: props.stage.id, config: { readonly: readOnly.value } })
    }

    return { onReadOnlyChange, readOnly, readOnlyTooltip }
  }
})
</script>
<style lang="scss" scoped>
.readonly {
  @include row;
  align-items: center;
  padding: 8px 8px 0px 8px;
  gap: 4px;

  &__icon {
    @include row;
    align-items: center;

    &:hover {
      cursor: help;
    }
  }
}
</style>
