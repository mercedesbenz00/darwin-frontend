<template>
  <settings-pane title="Performance Settings">
    <template #body>
      <div class="performance__content__section">
        <div class="performance__content__section__field">
          <div
            class="performance__content__section__field__label"
          >
            Max hardware concurrency
          </div>
          <div
            class="performance__content__section__field__content"
          >
            <small-numeric-input
              v-model="_hardwareConcurrency"
              v-input-auto-blur="true"
              class="performance__content__section__field__content__input"
              :min="1"
              :max="maxValue"
            />
            <info
              popover-class="performance__content__section__info"
              title="Max number of concurrent harware jobs"
              svg-overlay-color="rgba(255, 255, 255, 1)"
            >
              Decide the max amount of CPU thread used within the appliance UI.
              <br>
              <span class="bold">"{{ maxValue }}"</span>
              equals the total amount of
              <span class="bold">"available threads on this machine - 1"</span>,
              to avoid freezing the main thread.
            </info>
          </div>
          <div
            class="performance__content__section__field__hint"
          >
            Min: 1, Max: {{ maxValue }}
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <positive-button
        :disabled="loading"
        @click="save"
      >
        Save
      </positive-button>
    </template>
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Info from '@/components/Common/Info.vue'
import SmallNumericInput from '@/components/Common/SmallNumericInput.vue'

import SettingsPane from './SettingsPane.vue'

@Component({
  name: 'performance',
  components: { Info, SmallNumericInput, SettingsPane }
})
export default class Performance extends Vue {
  loading: boolean = false

  @State(state => state.workview.hardwareConcurrency)
  hardwareConcurrency!: number

  saveValue = this.hardwareConcurrency

  get _hardwareConcurrency (): number {
    return this.hardwareConcurrency
  }

  set _hardwareConcurrency (val: number) {
    this.saveValue = val
  }

  get maxValue (): number {
    // we strive to always leave the main thread free
    return navigator.hardwareConcurrency - 1
  }

  save (): void {
    this.loading = true

    this.$store.commit('workview/SET_HARDWARE_CONCURRENCY', this.saveValue)

    this.$store.dispatch('toast/notify', { content: 'Settings updated' })

    this.loading = false
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.performance__content__section__info {
  .info__hint__content {
    .bold {
      @include typography(md, inter, 600);
    }
  }
}
</style>
<!-- eslint-enable vue-scoped-css/enforce-style-type -->

<style lang="scss" scoped>
.performance {
  @include col;
  width: 100%;
  height: 100%;

  &__content {
    @include col;
    flex: 1;
    padding: 50px;

    &__section {
      @include row;
      justify-content: flex-start;

      &__field {
        @include col;
        margin-right: 40px;

        &__label,
        &__hint {
          @include typography(md, default);
          color: $colorSecondaryLight;
        }

        &__label {
          margin-bottom: 7px;
        }

        &__hint {
          margin-top: 7px;
        }

        &__content {
          @include row;
          gap: 12px;

          &__input {
            min-width: 96px;
          }
        }
      }
    }
  }
}
</style>
