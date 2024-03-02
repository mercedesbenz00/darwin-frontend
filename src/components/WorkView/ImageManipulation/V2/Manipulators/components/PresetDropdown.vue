<template>
  <div class="preset-dropdown">
    <dropdown
      v-model="_value"
      placeholder="Select a preset"
      :clearable="false"
      :options="presetOptions"
      @open="onOpen"
    >
      <template #search="{ attributes, events }">
        <input
          ref="searchRef"
          class="vs__search"
          v-bind="attributes"
          v-on="events"
        >
      </template>
      <template #option="option">
        <preset-option
          :option="option"
          @apply-changes="applyChanges(option)"
          @delete="maybeDeletePreset(option)"
          @edit="editPreset(option)"
        />
      </template>
      <template #selected-option="option">
        <preset-option
          :option="option"
          :is-selected="true"
        />
      </template>
      <template #list-footer>
        <div class="preset-dropdown__footer">
          <secondary-button
            class="preset-dropdown__add"
            size="medium"
            @click.stop.prevent="onNewPreset"
          >
            + Add Preset
          </secondary-button>
        </div>
      </template>
      <template #no-options>
        <div class="preset-dropdown__no-options">
          <div class="preset-dropdown__no-options__svg">
            <no-presets-image />
          </div>
          <div class="preset-dropdown__no-options__label">
            Save your first preset and quickly save and apply your image manipulation settings
          </div>
        </div>
      </template>
    </dropdown>

    <delete-confirmation-dialog
      button-text="Delete Preset"
      name="confirm-delete-preset"
      title="Delete Preset?"
      :detail="deleteMessage"
      @confirmed="deletePreset"
    />

    <preset-dialog
      ref="presetDialog"
      :editor="editor"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V2'
import Dropdown from '@/components/Common/Dropdown/Dropdown.vue'
import { Editor } from '@/engineV2/editor'
import { PresetPayload, RootState } from '@/store/types'

import PresetDialog from './PresetDialog.vue'
import PresetOption from './PresetOption.vue'
import NoPresetsImage from './assets/no-presets.svg?inline'
import { PresetOptionType } from './types'

@Component({
  name: 'preset-dropdown',
  components: {
    DeleteConfirmationDialog,
    Dropdown,
    NoPresetsImage,
    PresetDialog,
    PresetOption
  }
})
export default class PresetDropdown extends Vue {
  @Prop({ required: true, default: null })
  value!: number | null;

  @Prop({ required: true })
  editor!: Editor

  @State((state: RootState) => state.workview.presets)
  presets!: PresetPayload[]

  $refs!: {
    presetDialog: PresetDialog
    searchRef?: HTMLInputElement
  }

  selectedOption: PresetOptionType | null = null

  get _value (): PresetOptionType | null {
    return this.value
      ? this.presetOptions.find(f => f.id === this.value) || null
      : null
  }

  set _value (option: PresetOptionType | null) {
    const optionId = option ? option.id : null
    this.$emit('input', optionId)
    this.$emit('change', optionId)
  }

  get presetOptions (): PresetOptionType[] {
    const presetOptions = this.presets.map(preset => {
      return {
        id: preset.id,
        label: preset.name,
        hotKey: { keys: preset.keys }
      }
    })

    return presetOptions
  }

  get deleteMessage (): string {
    return `You are about to delete a user preset.
     Deleting it will remove it from your account's presets permanently.`
  }

  applyChanges (option: PresetOptionType): void {
    const selectedPreset = this.presets.find(preset => preset.id === option.id)

    if (selectedPreset) {
      this.$store.commit(
        'workview/PUSH_PRESET',
        {
          ...selectedPreset,
          manipulation: this.editor.activeView.imageFilter
        }
      )
      this.$store.dispatch(
        'toast/notify',
        { content: `Attributes saved to ${selectedPreset.name}` }
      )
    }
  }

  editPreset (option: PresetOptionType): void {
    this.$refs.presetDialog.show(option)
  }

  maybeDeletePreset (option: PresetOptionType): void {
    this.selectedOption = option
    this.$modal.show('confirm-delete-preset')
  }

  deletePreset (): void {
    if (this.selectedOption?.id) {
      this.$store.dispatch('workview/deletePreset', this.selectedOption.id)
    }
    this.selectedOption = null
    this.$modal.hide('confirm-delete-preset')
  }

  /**
   * Called when user clicks the "Add to preset" button on the preset
   * dropdown.
   */
  onNewPreset (): void {
    this.$refs.presetDialog.show()
  }

  onOpen (): void {
    this.$nextTick(() => {
      // This is the hacky solution to make the dropdown closed by default.
      this.$refs.searchRef?.focus()
    })
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss" scoped>
:deep(.vs__dropdown-option) {
  @include typography(md, default);
  color: $colorAliceNight;
  user-select: none;
  -webkit-user-select: none;
  padding: 6px 12px;

  &:not(:hover) {
    background: $colorWhite;
  }

  &.vs__dropdown-option--selected,
  &:hover {
    background: $colorFeatherFadeLight;
    font-weight: bold;
    color: $color90Black;
  }
}

:deep(.dropdown) .vs__dropdown-toggle input.vs__search {
  display: block;
}

:deep(.vs__dropdown-menu) {
  z-index: 100000;
}

.preset-dropdown__add {
  width: 100%;
  border-radius: 8px!important;
}
.preset-dropdown__footer {
  padding: 8px 12px;
}

.preset-dropdown__no-options {
  @include col--center;
  padding: 14px 24px;
}

.preset-dropdown__no-options__svg {
  width: 120px;
  height: 97px;
  overflow: hidden;

  & > svg {
    width: 100%;
    height: 100%;
  }
}

.preset-dropdown__no-options__label {
  @include typography(lg);
  color: $color90Black;
  text-align: center;
  margin-top: 12px;
}
</style>
