<template>
  <div
    class="workflow__status"
  >
    <badge
      :label="`${variant}`"
      :color="color"
      size="small"
    >
      <template #prefix-icon>
        <status
          :value="status"
          style="opacity: .33;"
        />
      </template>
    </badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Badge } from '@/components/Common/Badge'
import { Status } from '@/components/Common/Status'
import { RGBA, hslaToRGBA } from '@/utils'

import { WorkflowStatusVariant, WorkflowStatusProps } from './types'

@Component({
  name: 'workflow-status',
  components: {
    Badge,
    Status
  }
})
export default class WorkflowCard extends Vue {
  @Prop({ type: String })
  variant!: WorkflowStatusProps['variant']

  get color (): RGBA {
    if (this.variant === WorkflowStatusVariant.ACTIVE ||
      this.variant === WorkflowStatusVariant.RUNNING) {
      return hslaToRGBA({ h: 120, s: 52, l: 48, a: 1 })
    } else if (this.variant === WorkflowStatusVariant.DRAFT) {
      return hslaToRGBA({ h: 30, s: 96, l: 48, a: 1 })
    } else if (this.variant === WorkflowStatusVariant.OFFLINE) {
      return hslaToRGBA({ h: 0, s: 80, l: 48, a: 1 })
    }
    return hslaToRGBA({ h: 212, s: 8, l: 48, a: 1 })
  }

  get status (): string {
    return this.variant || WorkflowStatusVariant.INACTIVE
  }
}
</script>

<style lang="scss" scoped>
.workflow__status {
  @include row--center;
}
