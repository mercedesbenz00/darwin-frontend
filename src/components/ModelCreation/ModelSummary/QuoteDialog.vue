<template>
  <modal
    :name="name"
    transition="pop-out"
    width="40%"
    height="auto"
    :classes="['quote']"
    :click-to-close="false"
  >
    <div class="quote__info">
      <training-info />
      <training-time />
    </div>
    <div class="quote__payment payment">
      <div class="payment__amount-label">
        Estimated Cost
      </div>
      <div class="payment__amount">
        {{ costEstimateFormatted }}
      </div>
    </div>
    <div class="quote__footer">
      <secondary-button @click="onCancel">
        Cancel
      </secondary-button>
      <start-training-button />
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import StartTrainingButton from '@/components/ModelCreation/StartTrainingButton.vue'
import { UserPayload, RootState, TeamPayload } from '@/store/types'
import { formatCredit, CREDIT_RATIO, COST_PER_MINUTE, estimateTrainingHours } from '@/utils'

import TrainingInfo from './TrainingInfo.vue'
import TrainingTime from './TrainingTime.vue'

@Component({
  name: 'quote-dialog',
  components: {
    StartTrainingButton,
    TrainingInfo,
    TrainingTime
  }
})
export default class QuoteDialog extends Vue {
  // cost estimate

  @State((state: RootState) => state.neuralModel.newModelTrainingCounts)
  imageCount!: number | null

  get hoursEstimate (): number {
    const { imageCount } = this
    return estimateTrainingHours(imageCount || 0)
  }

  get costEstimate (): number {
    const { hoursEstimate } = this
    return Math.round(COST_PER_MINUTE * 60 * hoursEstimate / (CREDIT_RATIO * 100))
  }

  get costEstimateFormatted (): string {
    return formatCredit(this.costEstimate, 0)
  }

  // client-partner

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  get partner (): string | null {
    const { currentTeam } = this
    if (!currentTeam) { return null }
    if (currentTeam.managed_status !== 'client') { return null }

    if (!currentTeam.partner) {
      throw new Error(
        'Current team was incorrectly loaded. Client team is missing partner information'
      )
    }

    return currentTeam.partner.name
  }

  // dialog

  @Prop({ required: true, type: Boolean })
  open!: boolean

  show () {
    this.$emit('update:open', true)
  }

  close () {
    this.$emit('update:open', false)
  }

  onCancel () {
    this.$emit('cancel')
    this.close()
  }

  readonly name = 'model-quote'

  @Watch('open')
  onOpenStateChange (open: boolean) {
    if (open) {
      this.$modal.show(this.name)
      this.$store.dispatch('ui/putBackSidebar')
    } else {
      this.$modal.hide(this.name)
      this.$store.dispatch('ui/bringFrontSidebar')
    }
  }

  // superuser status

  @State(state => state.user.profile)
  user!: UserPayload | null

  get superuser (): boolean {
    const { user } = this
    return !!user && user.superuser
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.quote {
  display: grid;
  grid-auto-flow: row;
  row-gap: 25px;
  background: $colorAliceBlue;
  box-shadow: 0px 15px 30px rgba(145, 169, 192, 0.5);
  border-radius: 3px;
  padding: 40px;
}
</style>

<style lang="scss" scoped>
.quote__info,
.quote__footer {
  background: $colorAliceBlue;
}

.quote__info {
  display: grid;
  grid-auto-flow: row;
  row-gap: 10px;
}

.quote__payment.payment {
  display: flex;
  flex-direction: column;
  padding-top: 15px;
}

.payment__amount-label {
  @include typography(md);
  color: $colorSecondaryLight;
  margin-left: auto;
}

.payment__amount {
  @include typography(xl-1, default, bold);
  color: $colorBlack;
  margin-left: auto;
  padding-top: 15px;
}

.payment__amount,
.payment__amount-label {
  justify-self: right;
}

.quote__footer {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;

  > * {
    width: 166px;
  }
}
</style>
