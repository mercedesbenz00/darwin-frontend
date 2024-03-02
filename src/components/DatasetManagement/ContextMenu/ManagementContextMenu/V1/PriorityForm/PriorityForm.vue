<template>
  <div class="priority-form">
    <div
      class="priority-form__value priority-form__value-null"
      @click.prevent="onPriority(0)"
    >
      -
    </div>
    <div class="priority-form__custom">
      <label class="priority-form__label">Custom</label>
      <input
        v-model="customPriority"
        class="priority-form__custom-input"
        type="text"
        @keyup.stop="onCustomKeyup"
        @keydown.enter.stop="onSubmitCustom"
      >
    </div>
    <div class="priority-form__range">
      <div class="priority-form__range__labels">
        <label class="priority-form__label">Low</label>
        <label class="priority-form__label">High</label>
      </div>
      <div class="priority-form__values">
        <div
          v-for="index in 5"
          :key="index"
          :class="`priority-form__value priority-form__value-${index}`"
          @click="onPriority(index)"
        >
          {{ index }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import NumericInput from '@/components/Common/NumericInput.vue'

@Component({
  name: 'priority-context-menu-item',
  components: { NumericInput }
})
export default class PriorityForm extends Vue {
  @Prop({ required: false, default: 0 })
  priority!: number

  customPriority: string = ''

  onCustomKeyup (event: KeyboardEvent) {
    const value = parseInt((event.currentTarget as HTMLInputElement).value)
    if (isNaN(value)) {
      this.customPriority = ''
      return
    }
    this.customPriority = `${value}`
  }

  onPriority (priority: number = 0) {
    this.$emit('update:priority', priority)
    this.$emit('submit', priority)
  }

  onSubmitCustom () {
    if (!this.customPriority) { return }
    this.onPriority(parseInt(this.customPriority))
  }
}
</script>

<style lang="scss" scoped>
.priority-form {
  width: 100%;
  height: 76px;
  @include row;
  padding: 12px;
}

.priority-form__value {
  width: 25px;
  height: 25px;
  text-align: center;
  margin: 1px;
  padding-top: 1px;
  border-radius: 5px;
  border: 2px solid rgba(0, 0, 0, .2);
  color: $colorWhite;
  @include typography(md-1, default, bold);
  @include noSelect;
  @include workflow-item-priority-value;
  cursor: pointer;
  transition: transform .1s;

  &:hover, &:active {
    transform: scale(1.06);
  }
}

.priority-form__value-null {
  margin-top: 24px;

  &:hover, &:active {
    margin-top: 23px;
  }
}

.priority-form__label {
  @include typography(sm, default, bold);
  text-align: center;
  color: $colorAliceNight;
  margin-bottom: 10px;
}

.priority-form__custom {
  @include col;
  align-items: flex-end;
  margin: 0 10px;

  .priority-form__label {
    text-align: right;
  }
}

.priority-form__custom-input {
  width: 25px;
  height: 25px;
  @include typography(sm, default, bold);
  border-radius: 5px;
  padding: 0 2px;
  margin: 1px;
  color: $color90Black;
  background: $colorAliceBlue;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
}

.priority-form__range {
  @include col;
}

.priority-form__range__labels {
  width: 100%;
  @include row--distributed--center;
}

.priority-form__values {
  @include row--center;
}
</style>
