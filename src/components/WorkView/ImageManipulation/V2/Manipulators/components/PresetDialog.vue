<template>
  <modal
    name="preset"
    transition="pop-out"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    :classes="['preset-dialog']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <div class="modal__header">
      <p class="modal__header__title">
        {{ editing ? 'Edit Preset' : 'Create new Preset' }}
      </p>
    </div>
    <div
      class="modal__content modal__content-preset"
    >
      <input-field
        v-model="preset.label"
        auto-focus
        label="Name"
        theme="light"
        required="required"
      />
      <div class="preset-hotkey">
        <hotkey-input
          :hotkey.sync="preset.hotKey"
          :disabled-special="true"
        />
      </div>
    </div>
    <div class="modal__footer">
      <secondary-button @click="close">
        Cancel
      </secondary-button>
      <positive-button
        :disabled="disabled || loading"
        @click="savePreset"
      >
        {{ editing ? 'Save' : 'Create Preset' }}
      </positive-button>
    </div>
  </modal>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { Editor } from '@/engineV2/editor'
import { PresetPayload, RootState } from '@/store/types'

import HotkeyInput from './HotkeyInput.vue'
import { PresetOptionType } from './types'

const newPresetOption = (): PresetOptionType => ({
  label: '',
  hotKey: { keys: ['Tab'] }
})
/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
@Component({
  name: 'preset-dialog',
  components: {
    HotkeyInput, InputField
  }
})
export default class PresetDialog extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @State((state: RootState) => state.workview.presets)
  presets!: PresetPayload[]

  preset: PresetOptionType = newPresetOption()

  controlText: string = ''
  loading: boolean = false

  get editing (): boolean {
    return !!this.preset.id
  }

  get disabled (): boolean {
    return (
      this.loading ||
      this.preset.label === null ||
      isEmpty(this.preset.label)
    )
  }

  get hotkey (): string | null {
    if (!this.preset?.hotKey?.keys) { return null }
    const { keys } = this.preset?.hotKey
    return keys.length > 1 ? keys[1] : null
  }

  @Watch('hotkey')
  onhotkeyChanged (): void {
    if (!this.hotkey) { return }

    const duplicatedPreset = this.getDuplicatedPreset()
    if (!duplicatedPreset) { return }

    this.$store.dispatch(
      'toast/warning',
      {
        content: `Will replace ${duplicatedPreset.name}'s existing hotkey`
      }
    )
  }

  onBeforeOpen (): void {
    this.$store.dispatch('ui/putBackSidebar')
    this.editor.activeView.removeListeners()
  }

  onClosed (): void {
    this.$store.dispatch('ui/bringFrontSidebar')
    this.editor.activeView.addListeners()
    this.controlText = ''
  }

  getDuplicatedPreset (): PresetPayload | null {
    return this.presets.find(item => {
      if (item.id === this.preset.id) { return true }
      if (item.keys && item.keys.length > 1) {
        return item.keys[1] === this.hotkey
      }
      return false
    }) || null
  }

  show (data?: PresetOptionType): void {
    if (data) {
      this.preset = { ...data }
    } else {
      this.preset = newPresetOption()
    }
    this.loading = false
    this.$modal.show('preset')
  }

  cancel (): void {
    this.$emit('canceled')
    this.close()
  }

  close (): void {
    this.$modal.hide('preset')
  }

  generatePresetPayload (data: PresetOptionType): PresetPayload {
    return {
      id: data.id ? data.id : new Date().getTime(),
      name: data.label,
      keys: data.hotKey ? data.hotKey.keys : [],
      manipulation: this.editor.activeView.imageFilter
    }
  }

  savePreset (): void {
    const duplicatedPreset = this.getDuplicatedPreset()
    if (duplicatedPreset) {
      this.$store.dispatch('workview/savePreset', { ...duplicatedPreset, keys: [] })
    }
    this.$store.dispatch('workview/savePreset', this.generatePresetPayload(this.preset))
    this.close()
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modal__header {
  background: $colorAliceShade;
  padding: 18px 30px;
}

.modal__header__text {
  @include typography(md);
  margin: 10px 0 0 0;
  color: $colorAliceNight;
}

.modal__content-preset {
  padding: 30px;
  background: $colorAliceBlue;
  overflow: hidden auto;

  display: grid;
  grid-auto-flow: row;
  row-gap: 30px;
}

.preset-hotkey {
  margin-top: 12px;
}

.modal__footer {
  background: $colorAliceBlue;
  box-shadow: 0px -5px 10px rgba(145, 169, 192, 0.1) !important;
  overflow: visible;

  button {
    flex: 1;
    margin: 0 10px;
  }
}

</style>
