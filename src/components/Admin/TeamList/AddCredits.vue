<template>
  <div class="credit">
    <button
      class="credit__button"
      @click.stop="openModal"
    >
      <circle-plus-icon />
    </button>
    <modal
      :name="modalName"
      width="500px"
      height="auto"
    >
      <div class="modal__header">
        <h2 class="modal__header__title">
          Create annotation credits
        </h2>
      </div>
      <div class="modal__content">
        <h3 class="credit__title">
          {{ `Select amount of annotation hours to give to ${team.name}` }}
        </h3>
        <div class="credit__amounts credit__presets">
          <component
            :is="selectedAmount === amount ? 'positive-button' : 'secondary-button'"
            v-for="{ label, amount } of amounts"
            :key="amount"
            @click="selectAmount(amount)"
          >
            {{ label }}
          </component>
        </div>
        <input-field
          ref="amount"
          class="credit__custom-amount"
          label="Custom amount"
          type="number"
          required
          :value="selectedHours"
          :error="selectedAmountError"
          @input="selectAmount($event * 3600)"
        />
        <div class="credit__dates credit__presets">
          <component
            :is="expiresAt === date ? 'positive-button' : 'secondary-button'"
            v-for="{ date, label, tooltip } of expiryDates"
            :key="label"
            v-tooltip="tooltip"
            @click="expiresAt = date"
          >
            {{ label }}
          </component>
        </div>
        <input-field
          class="credit__custom-date"
          label="Custom date"
          type="date"
          required
          :value="expiresAt"
          @input="expiresAt = $event"
        />
        <div class="credit__note">
          <text-area
            label="Note"
            :value="note"
            @input="note = $event"
          />
        </div>
      </div>
      <div class="modal__footer">
        <secondary-button @click="closeModal">
          Cancel
        </secondary-button>
        <positive-button @click="createCredit">
          Create
        </positive-button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CirclePlusIcon } from '@/assets/icons/V1'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import TextArea from '@/components/Common/TextArea.vue'
import { createCredit } from '@/store/modules/admin/actions/createCredit'
import { TeamPayload } from '@/store/modules/admin/types'
import { StoreActionPayload } from '@/store/types'
import { formatFromDateInput, formatForDateInput, startOfDay } from '@/utils'

@Component({
  name: 'add-credits',
  components: { CirclePlusIcon, InputField, TextArea }
})
export default class AddCredits extends Vue {
  @Prop({ required: true })
  team!: TeamPayload

  // modal UI

  get modalName (): string {
    return `credit-${this.team.id}`
  }

  openModal () {
    this.$modal.show(this.modalName)
  }

  closeModal () {
    this.$modal.hide(this.modalName)
  }

  // selection UI

  amounts = [
    { label: `${(1000).toLocaleString()} hours`, amount: 1000 * 3600 },
    { label: `${(10000).toLocaleString()} hours`, amount: 10000 * 3600 }
  ]

  selectedAmount = this.amounts[0].amount
  selectedAmountError: string | null = null

  get selectedHours (): number {
    return this.selectedAmount / 3600
  }

  selectAmount (amount: number): void {
    this.selectedAmount = amount
  }

  note: null | string = null

  expiryDates = [
    {
      label: 'Standard',
      tooltip: 'Expires in a year',
      date: formatForDateInput(startOfDay(1, 'year'))
    },
    {
      label: 'Trial',
      tooltip: 'Expires in two weeks',
      date: formatForDateInput(startOfDay(14, 'day'))
    }
  ]

  expiresAt: string = this.expiryDates[0].date

  // credit creation

  async createCredit () {
    this.selectedAmountError = null

    const params: StoreActionPayload<typeof createCredit> = {
      amountBilled: this.selectedAmount,
      expiresAt: formatFromDateInput(this.expiresAt),
      note: this.note,
      team: this.team
    }
    const { error } = await this.$store.dispatch('admin/createCredit', params)

    if (error) {
      if (error.isValidationError) { this.selectedAmountError = error.amountBilled }
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.closeModal()
  }
}
</script>

<style lang="scss" scoped>
.credit__button {
  border-radius: 50%;
  height: 22px;
  width: 22px;
  background: $colorPrimaryLight;
  padding: 0;
}

.credit__button svg {
  width: 100%;
  height: auto;
}

.credit__button:hover {
  background: $colorPrimaryLight2;
}

.credit__title {
  color: $colorSecondaryDark;
  text-align: center;
  white-space: normal;
  @include typography(xl, default, bold);
  margin-bottom: 20px;
}

.credit__amounts {
  @include row--center;
  padding: 20px 0;
}

.credit__custom-amount {
  padding-bottom: 1.5em;
}

.credit__presets {
  @include row;
  margin-bottom: 20px;
}

.credit__presets > :deep(button:not(:last-child)) {
  margin-right: 10px;
}

.credit__note {
  padding: 20px 0;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.credit__custom-date ::-webkit-clear-button,
.credit__custom-date ::-ms-clear {
  display: none;
}
</style>
