<template>
  <div class="instances">
    <h3 class="instances__header">
      Number of servers
    </h3>
    <div class="instances__selection">
      <numeric-input
        class="instances__selection__input"
        label="Minimum"
        :min="1"
        :value="minimum"
        @change="onMinimum"
      />
      <numeric-input
        class="instances__selection__input"
        label="Maximum"
        :min="minimum"
        :value="maximum"
        @change="onMaximum"
      />
    </div>
    <div class="instances__auto">
      <div class="instances__auto__start">
        <check-box
          label="Start when Invoked"
          :value="autoStart"
          @change="onAutoStart"
        />
        <tooltip-info
          class="instances__auto__start__info"
          content="
            Automatically start this Model when it receives inference requests
            while it is stopped.
          "
          placement="bottom"
        />
      </div>
      <div class="instances__auto__stop">
        <check-box
          label="Stop when Idle"
          :value="autoStop"
          @change="onAutoStop"
        />
        <tooltip-info
          class="instances__auto__stop__info"
          content="
            Automatically stop this Model when it does not receive
            any requests for more than 1 hour.
          "
          placement="bottom"
        />
      </div>
    </div>
    <div class="instances__description">
      Handles up to {{ maxRequests }} images per second
    </div>
    <div
      class="instances__note"
    >
      V7 will always use the minimum number of necessary instances to handle load.
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import NumericInput from '@/components/Common/NumericInput.vue'
import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import { requestsPerSecond } from '@/utils'

@Component({ name: 'instance-count', components: { CheckBox, NumericInput, TooltipInfo } })
export default class InstanceCount extends Vue {
  @Prop({ required: true, type: Boolean as () => boolean })
  autoStart!: boolean

  @Prop({ required: true, type: Boolean as () => boolean })
  autoStop!: boolean

  @Prop({ required: true, type: Number as () => number })
  minimum!: number

  @Prop({ required: true, type: Number as () => number })
  maximum!: number

  get maxRequests (): number {
    return requestsPerSecond(this.maximum)
  }

  onAutoStart (value: { checked: boolean }): void {
    const { checked } = value
    this.$emit('update:auto-start', checked)
  }

  onAutoStop (value: { checked: boolean }): void {
    const { checked } = value
    this.$emit('update:auto-stop', checked)
  }

  onMaximum (value: number): void {
    const maximum = Math.max(value, 1)

    this.$emit('update:maximum', maximum)

    if (maximum < this.minimum) {
      this.$emit('update:minimum', maximum)
    }
  }

  onMinimum (value: number): void {
    const minimum = Math.max(value, 1)

    this.$emit('update:minimum', minimum)

    if (minimum > this.maximum) {
      this.$emit('update:maximum', minimum)
    }
  }
}
</script>

<style lang="scss" scoped>
.instances {
  display: grid;
  grid-template-areas:
    "header header"
    "selection description"
    "note note";
  grid-template-rows: auto auto auto;
  grid-gap: 15px;
  align-items: center;
  justify-content: space-evenly;
}

.instances__header {
  grid-area: header;
  @include typography(md-1, Mulish, bold);
}

.instances__description {
  grid-area: description;
  @include typography(md, Mulish);
}

.instances__selection {
  grid-area: selection;
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-evenly;

  .instances__selection__input {
    @include typography(md, Mulish)
  }
}

.instances__auto__start {
  display: flex;
  margin-bottom: 12px;
}

.instances__auto__start__info {
  margin-left: 10px;
}

.instances__auto__stop {
  display: flex;
}

.instances__auto__stop__info {
  margin-left: 10px;
}

.instances__note {
  grid-area: note;
  @include typography(md, Mulish);
  color: $colorAliceNight;
  padding: 10px 0 0 0;
}
</style>
