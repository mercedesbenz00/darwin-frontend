<template>
  <div
    v-if="isIdle"
    class="storage-extra"
  >
    <div class="storage-extra__value">
      {{ extraStorage }}
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
    class="storage-extra storage-extra--editing"
  >
    <input-field
      v-model="newValue"
      :disabled="isSaving"
      :error="error"
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
  name: 'extra-storage', components: { InputField }
})
export default class ExtraStorage extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get extraStorage (): number {
    return this.team.customer_v3.customer_subscription.storage_extra
  }

  status: Status = Status.Idle

  get isIdle (): boolean { return this.status === Status.Idle }
  get isEditing (): boolean { return this.status === Status.Editing }
  get isSaving (): boolean { return this.status === Status.Saving }

  newValue: number = -1

  change () {
    this.newValue = this.extraStorage
    this.status = Status.Editing
  }

  error: string | null = null

  async save () {
    this.status = Status.Saving
    const { team, newValue } = this
    const payload: StoreActionPayload<typeof updateCustomerSubscription> = {
      team,
      storage_extra: newValue
    }

    const { error } = await this.$store.dispatch('admin/updateCustomerSubscription', payload)
    if (error && error.isValidationError) {
      this.error = error.storage_extra
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
.storage-extra {
  display: grid;
  grid-auto-flow: column;
  column-gap: .5em;
  align-items: center;
  justify-content: start;
}
</style>
