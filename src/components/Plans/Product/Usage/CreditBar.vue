<template>
  <div class="credit-usage-summary">
    <div class="credit-usage__progress">
      <div
        class="credit-usage__human"
        :style="{ width: `${humanPercentage}%` }"
      />
      <div
        class="credit-usage__automation"
        :style="{ width: `${automationPercentage}%` }"
      />
      <div
        class="credit-usage__model"
        :style="{ width: `${modelPercentage}%` }"
      />
      <div
        v-if="clientPercentage > 0"
        class="credit-usage__client"
        :style="{ width: `${clientPercentage}%` }"
      />
    </div>

    <div class="credit-usage__labels">
      <div
        class="credit-usage__human"
        :style="{ minWidth: `${humanPercentage}%` }"
      >
        {{ humanHours }} in Human Hours
      </div>
      <div
        class="credit-usage__automation"
        :style="{ minWidth: `${automationPercentage}%` }"
      >
        {{ automationHours }} in Automation
      </div>
      <div
        class="credit-usage__model"
        :style="{ minWidth: `${modelPercentage}%` }"
      >
        {{ modelUsageHours }} in Model Uptime
      </div>
      <div
        v-if="clientPercentage > 0"
        class="credit-usage__client"
        :style="{ minWidth: `${clientPercentage}%` }"
      >
        {{ clientHours }} in Clients
      </div>
      <div class="credit-usage__used">
        {{ usedHours }} Used
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { CreditUsagePayload } from '@/store/types'

@Component({ name: 'credit-bar' })
export default class CreditBar extends Vue {
  @Prop({ required: true })
  creditUsage!: CreditUsagePayload

  get humanHours () {
    return this.creditUsage.used_human_hours
  }

  get humanPercentage () {
    const {
      used_human_hours: human,
      total_available_hours: total
    } = this.creditUsage

    return total > 0 ? (human / total) * 100 : 0
  }

  get automationHours () {
    return this.creditUsage.used_automation_hours
  }

  get modelUsageHours () {
    return this.creditUsage.used_model_hours
  }

  get automationPercentage () {
    const {
      used_automation_hours: automation,
      total_available_hours: total
    } = this.creditUsage

    return total > 0 ? (automation / total) * 100 : 0
  }

  get modelPercentage () {
    const {
      used_model_hours: model,
      total_available_hours: total
    } = this.creditUsage

    return total > 0 ? (model / total) * 100 : 0
  }

  get clientHours () {
    return this.creditUsage.total_client_used_hours
  }

  get clientPercentage () {
    const {
      total_client_used_hours: client,
      total_available_hours: total
    } = this.creditUsage

    return total > 0 ? (client / total) * 100 : 0
  }

  get usedHours () {
    return this.creditUsage.total_used_hours + this.creditUsage.total_client_used_hours
  }
}
</script>

<style lang="scss" scoped>
.credit-usage-summary {
  width: 100%;
  height: 52px;
  position: relative;
  border-radius: 26px;
  border: 6px solid $colorAliceShadow;
  background: $colorAliceNight;
  box-shadow: inset 0px 5px 10px rgba(88, 116, 141, 0.5);
  overflow: hidden;
}

@mixin summary-cell {
  @include row;
  align-items: center;
  height: 100%;
  @include ellipsis(1, md-1);
  @include typography(md-1, mulish, bold);
  color: white;
  overflow: visible;
}

.credit-usage__human,
.credit-usage__automation,
.credit-usage__model,
.credit-usage__client {
  @include summary-cell;
}

.credit-usage__used {
  margin-left: auto;
  @include summary-cell;
  margin-right: 8px;
  justify-content: flex-end;
  text-align: right;
}

.credit-usage__progress {
  position: absolute;
  @include fullsize;
  @include row;
  align-items: center;

  & > div {
    min-width: 5px;
  }

  .credit-usage__human {
    background: $colorAssignedBlue;
    box-shadow: inset 0px -4px 10px #3A7DBA, inset 0px 5px 10px #B5DBFD;
  }

  .credit-usage__automation {
    background: $colorModelPurple;
    box-shadow: inset 0px -4px 10px #60399F, inset 0px 5px 10px #D5BBFF;
  }

  .credit-usage__client {
    background: $colorPink2;
    box-shadow: inset 0px -4px 10px #DB69D0, inset 0px 5px 10px #FFE4FC;
  }

  .credit-usage__model {
    background: $colorYellow;
    box-shadow: inset 0px -4px 10px #8E7CC3, inset 0px 5px 10px #ABA3C4;
  }
}

.credit-usage__labels {
  position: absolute;
  @include fullsize;
  @include row;
  align-items: center;

  .credit-usage__human,
  .credit-usage__automation,
  .credit-usage__model,
  .credit-usage__client {
    padding: 0 5px 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
