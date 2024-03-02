<template>
  <div
    v-if="isIdle"
    class="seconds-per"
  >
    <div class="seconds-per__value">
      {{ secondsPerAutomationAction }}
    </div>
    <secondary-button
      size="small"
      @click="change"
    >
      Change
    </secondary-button>
  </div>
  <div
    v-else
    class="seconds-per seconds-per--editing"
  >
    <input-field
      v-model="newSecondsPer"
      :disabled="isSaving"
      :error="newSecondsPerError"
    />
    <negative-button
      size="small"
      @click="cancel"
    >
      Cancel
    </negative-button>
    <positive-button
      size="small"
      @click="save"
    >
      Save
    </positive-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import {
  updateCustomerSubscription
} from '@/store/modules/admin/actions/updateCustomerSubscription'
import { TeamPayload } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'

enum Status {
  Idle = 'idle',
  Editing = 'editing',
  Saving = 'saving'
}

@Component({
  name: 'seconds-per-automation-action', components: { InputField }
})
export default class SecondsPerAutomationAction extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get secondsPerAutomationAction (): number {
    return this.team.customer_v3
      ? this.team.customer_v3.customer_subscription.seconds_per_automation_action
      : 36
  }

  status: Status = Status.Idle
  get isIdle (): boolean { return this.status === Status.Idle }
  get isEditing (): boolean { return this.status === Status.Editing }
  get isSaving (): boolean { return this.status === Status.Saving }

  newSecondsPer: number = -1

  change () {
    this.newSecondsPer = this.secondsPerAutomationAction
    this.status = Status.Editing
  }

  newSecondsPerError: string | null = null

  async save () {
    this.status = Status.Saving
    const { team, newSecondsPer } = this
    const payload: StoreActionPayload<typeof updateCustomerSubscription> = {
      team,
      seconds_per_automation_action: newSecondsPer
    }

    const { error } = await this.$store.dispatch('admin/updateCustomerSubscription', payload)
    if (error && error.isValidationError) {
      this.newSecondsPerError = error.seconds_per_automation_action
      this.status = Status.Editing
    } else {
      this.status = Status.Idle
    }
  }

  cancel () {
    this.status = Status.Idle
  }
}
</script>

<style lang="scss" scoped>
.seconds-per {
  display: grid;
  grid-auto-flow: column;
  column-gap: .5em;
  align-items: center;
  justify-content: start;
}
</style>
