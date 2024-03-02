<template>
  <stage-template class="code">
    <template #header>
      <code-round-icon class="code__header__icon" />
      <stage-title
        :value="name"
        @change="updateName"
      />
      <move-handler />
      <delete-button
        v-if="deletable"
        @click="$emit('delete')"
      />
    </template>
    <template #body>
      <div
        class="code__body"
      >
        Runs custom logic on results from previous stage, and sends to next stage.
      </div>
    </template>
  </stage-template>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CodeRoundIcon } from '@/assets/icons/V1'
import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'
import MoveHandler from '@/components/Common/MoveHandler.vue'
import { WorkflowStageTemplatePayload } from '@/store/types'

import StageTemplate from './StageTemplate.vue'
import StageTitle from './StageTitle.vue'

@Component({
  name: 'code-stage',
  components: {
    CodeRoundIcon,
    DeleteButton,
    MoveHandler,
    StageTemplate,
    StageTitle
  }
})
export default class CodeStage extends Vue {
  @Prop({ required: false, default: false })
  deletable!: boolean

  @Prop({ required: true, type: Object as () => WorkflowStageTemplatePayload })
  stage!: WorkflowStageTemplatePayload

  get name (): string {
    return this.stage.name || ''
  }

  updateName (value: string): void {
    this.$emit('change', { ...this.stage, name: value })
  }
}
</script>

<style lang="scss" scoped>
.code__header__icon {
  height: 20px;
  width: 20px;
  color: $colorCodeOrange;
  border-radius: 50%;

  display: grid;
  align-items: center;
  justify-content: center;

  svg {
    height: 20px;
    width: 20px;
  }
}

.code :deep(.stage__body) {
  align-self: center;
}

.code__body {
  text-align: center;
  color: $colorAliceNight;
}
</style>
