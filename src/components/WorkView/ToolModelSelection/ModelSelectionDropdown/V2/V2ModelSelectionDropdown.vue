<template>
  <div class="model__dropdown">
    <select-field
      ref="selectField"
      v-model="sel"
      :options="filteredOptions"
      :disabled="disabled"
      :required="true"
      :empty="`No models found with keyword '${search}'`"
      popup-menu-classname="popup-menu-mode-selection-dropdown"
      custom
      @open="onOpen"
      @close="onClose"
      @input="onSelect"
    >
      <template #label>
        <div class="model__dropdown__selected">
          <v2-model-icon
            v-if="type"
            class="model__dropdown__selected__icon"
            :model-type="type"
          />
          <span class="model__dropdown__selected__label">
            {{ label || 'Model Name' }}
          </span>
        </div>
      </template>
      <template #dropdown-header>
        <div class="model__dropdown__header">
          <search-field
            ref="searchField"
            v-model="search"
            class="model__dropdown__header__search"
            placeholder="Search Models or Class"
            :disabled="disabled"
            @keydown="onSearchKeydown"
          />
        </div>
      </template>
      <template scope="{ option }">
        <v2-model-selection-dropdown-item
          tabindex="1"
          :key="option.id"
          class="model__dropdown__item"
          :option="option"
          :selected="option.id === sel"
          @submit="onSelect(option, true)"
        />
      </template>
      <template #dropdown-footer>
        <div class="model__dropdown__footer">
          <custom-button
            size="medium"
            tag="router-link"
            flair="rounded"
            :to="'/models'"
            full-width
          >
            Manage Models
          </custom-button>
        </div>
      </template>
    </select-field>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  nextTick,
  onMounted,
  PropType,
  ref,
  Ref,
  SetupContext,
  watch
} from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import SelectField from '@/components/Common/SelectField/V2/SelectField.vue'
import {
  V2ModelSelectionDropdownItem,
  ModelSelectionDropdownOption,
  V2ModelIcon
} from '@/components/WorkView/ToolModelSelection/ModelSelectionDropdown/V2'
import { getIdNext } from '@/utils/array'

export default defineComponent({
  name: 'V2ModelSelectionDropdown',
  components: {
    SearchField,
    SelectField,
    V2ModelIcon,
    V2ModelSelectionDropdownItem,
    CustomButton
  },
  props: {
    value: { default: '', type: [String, Number] },
    options: { required: true, type: Array as PropType<ModelSelectionDropdownOption[]> },
    disabled: { default: false, type: Boolean },
    placeholder: { default: '', type: String }
  },
  setup (props, { emit }: SetupContext) {
    const selectField = ref<HTMLDivElement>()
    const searchField = ref<HTMLDivElement>()
    const search: Ref<string> = ref('')
    const open: Ref<boolean> = ref(false)

    const sel = computed({
      get (): string | number {
        return props.value
      },
      set (val) {
        emit('input', val)
        emit('change', val)
      }
    })

    const filteredOptions = computed((): ModelSelectionDropdownOption[] => {
      return props.options
        .filter(({ label, classes }) => {
          const _label = label.toLowerCase()
          const _search = search.value.toLowerCase()
          const _classes = classes && classes
            .some(({ label }) => label?.toLowerCase().includes(_search))
          return !search.value || search.value === '' || _label.includes(_search) || _classes
        })
    })

    const selectedModel = computed((): ModelSelectionDropdownOption | undefined => {
      return filteredOptions.value.find(({ id }) => id === sel.value)
    })

    const selectedIdx = computed((): number => {
      return filteredOptions.value.findIndex(({ id }) => id === sel.value)
    })

    const type = computed((): string => {
      if (!selectedModel.value) { return '' }
      return selectedModel.value?.type || ''
    })

    const label = computed((): string => {
      if (!selectedModel.value) { return '' }
      return selectedModel.value?.label || ''
    })

    const optionsLenght = computed((): number => {
      return filteredOptions.value.length
    })

    const onOpen = async (): Promise<void> => {
      await nextTick() // needed otherwise the searchField ref will be undefined
      if (searchField.value) {
        const { input: searchInput } = (searchField.value as any).$refs
        searchInput?.focus()
      }
      await nextTick()
      open.value = true
    }

    const onClose = async (): Promise<void> => {
      if (selectField.value) { (selectField.value as any).open = false }
      await nextTick()
      open.value = false
    }

    const onSelect = (item: ModelSelectionDropdownOption, close = false): void => {
      if (!item) { return }
      sel.value = item?.id
      if (close) { onClose() }
    }

    // if the selected model is no more visible in the
    // filtered list, then automatically select the first
    // item in the filteredOptions
    watch(search, () => {
      if (!filteredOptions.value.some(({ id }) => id === sel.value)) {
        sel.value = filteredOptions.value[0]?.id
      }
    })

    onMounted((): void => {
      // automatically select Generic Auto-annotate
      sel.value = filteredOptions.value[0]?.id
    })

    // that keydown handler it's only used if the searchField
    // it's currently focused, otherwise refer to selectField's
    // useHotkeysNavigation
    const onSearchKeydown = (evt: KeyboardEvent): void => {
      if (!open.value) { return }
      if (['ArrowUp', 'ArrowDown'].includes(evt.key)) {
        const newIdx = getIdNext(selectedIdx.value, optionsLenght.value, evt.key === 'ArrowDown')
        sel.value = filteredOptions.value[newIdx]?.id
      } else if (['Enter', 'Escape'].includes(evt.key)) {
        onClose()
      }
    }

    return {
      selectField,
      searchField,
      search,
      open,
      sel,
      filteredOptions,
      selectedModel,
      selectedIdx,
      type,
      label,
      optionsLenght,
      onOpen,
      onClose,
      onSelect,
      onSearchKeydown
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu.popup-menu-mode-selection-dropdown {
  width: 300px;
  padding: 4px 4px 0 4px;

  .menu__wrapper {
    padding-bottom: 48px !important;

    .popup-menu__wrapper {
      overflow: visible;
    }
  }
}
</style>

<style lang="scss" scoped>
$borderRadius: 10px;
.model__dropdown {
  position: relative;

  &__header,
  &__footer {
    display: flex;
    flex: 0 0 auto;
    max-width: 100%;
  }

  &__header {
    border-radius: $borderRadius $borderRadius 0 0;
    margin-bottom: 4px;

    &__search{
      width: 100%;
    }
  }

  &__footer {
    position: absolute;
    right: 0;
    bottom: -48px;
    left: -4px;
    width: calc(300px - 1px);
    max-width: unset;
    height: 44px;
    padding: 4px;
    border-radius: 0 0 $borderRadius $borderRadius;
    background-color: $colorNeutrals100;
    border-top: 1px solid $colorBorderLight;
  }

  .select-field {
    width: 100%;

    & > :deep(.menu__container) {
      width: 300px;
      left: -1px;

      .menu__wrapper {
        position: relative;
        padding: 0;
      }
    }
  }

  &__selected {
    @include row--center;

    &__icon {
      margin-top: 1px;
    }

    &__label {
      @include ellipsis(1, md);
      @include typography(md, inter, 500);
      max-width: 112px;
      margin-left: 8px;
    }
  }
}
</style>
