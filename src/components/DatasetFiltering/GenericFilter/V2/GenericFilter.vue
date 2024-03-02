<template>
  <dropdown
    class="generic-filter"
    :class="{ 'generic-filter--loading': loading }"
    multiple
    placeholder="Search or filter"
    :filterable="true"
    :options="filteredOptions"
    :value="selectedAllOptions"
  >
    <template #search="{ attributes, events }">
      <div class="input-wrapper">
        <icon-mono-search
          v-if="selectedAllOptions.length===0"
        />
        <input
          class="vs__search"
          v-bind="attributes"
          :value="searchValue"
          v-on="events"
          @input="onSearchInput"
        >
      </div>
    </template>
    <template #option="option">
      <generic-filter-option
        :option="option"
        :status="getOptionStatus(option)"
        @toggle="toggleOption"
        @shift-toggle="shiftToggleOption"
      />
    </template>
    <template #selected-option-container="{ option }">
      <generic-filter-selected-option
        :option="option"
        :status="getOptionStatus(option)"
        @deselect="deselectOption"
      />
    </template>
    <template #no-options>
      <div class="generic-filter__no-option">
        Sorry, no matching options
      </div>
    </template>
  </dropdown>
</template>

<script lang="ts">
import { uniq } from 'lodash'
import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType,
  Ref
} from 'vue'

import { IconMonoSearch } from '@/assets/icons/V2/Mono'
import Dropdown from '@/components/Common/Dropdown/V2/Dropdown.vue'
import {
  GenericFilterOptionType,
  membershipToOption,
  folderToOptionV2,
  filenameToOption
} from '@/components/DatasetFiltering/GenericFilter'
import {
  DatasetItemFilenamePayload,
  DatasetPayload,
  MembershipPayload,
  V2DatasetFolderPayload
} from '@/store/types'
import { TriToggleStatus } from '@/utils'

import GenericFilterOption from './GenericFilterOption.vue'
import GenericFilterSelectedOption from './GenericFilterSelectedOption.vue'

const isOptionMatch = (option: GenericFilterOptionType, search: string): boolean => {
  return (option.label || '').toLowerCase().indexOf(search.toLowerCase()) > -1
}

export default defineComponent({
  name: 'GenericFilter',
  components: {
    Dropdown,
    IconMonoSearch,
    GenericFilterOption,
    GenericFilterSelectedOption
  },
  props: {
    keyword: {
      required: true,
      type: String
    },
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    members: {
      required: true,
      type: Array as PropType<MembershipPayload[]>
    },
    selectedPositiveMembers: {
      required: true,
      type: Array as PropType<MembershipPayload[]>
    },
    selectedNegativeMembers: {
      required: true,
      type: Array as PropType<MembershipPayload[]>
    },
    folders: {
      required: true,
      type: Array as PropType<V2DatasetFolderPayload[]>
    },
    selectedPositiveFolders: {
      required: true,
      type: Array as PropType<V2DatasetFolderPayload[]>
    },
    selectedNegativeFolders: {
      required: true,
      type: Array as PropType<V2DatasetFolderPayload[]>
    },
    filenames: {
      required: true,
      type: Array as PropType<DatasetItemFilenamePayload[]>
    },
    selectedPositiveFilenames: {
      required: true,
      type: Array as PropType<DatasetItemFilenamePayload[]>
    },
    selectedNegativeFilenames: {
      required: true,
      type: Array as PropType<DatasetItemFilenamePayload[]>
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const searchValue: Ref<string> = ref('')
    const options: Ref<GenericFilterOptionType[]> = computed(() => {
      // When filename is empty, `filenames` is empty as well.
      // When `selectedFilenames` is not empty, we should show them as options
      // That's why we need to merge `filenames` with `selectedFilenames`
      const possibleFilenames = uniq([
        ...props.filenames,
        ...props.selectedPositiveFilenames,
        ...props.selectedNegativeFilenames
      ])
      return [
        ...props.members.map(membershipToOption),
        ...props.folders.map(f => folderToOptionV2(f, props.dataset)),
        ...possibleFilenames.map(filenameToOption)
      ]
    })

    const filteredOptions: Ref<GenericFilterOptionType[]> = computed(() => {
      const filteredOptions = options.value.filter(op => isOptionMatch(op, searchValue.value))

      const firstMemberIndex = filteredOptions.findIndex(op => op.type === 'assignees')
      const firstFilenameIndex = filteredOptions.findIndex(op => op.type === 'filenames')
      const firstPathIndex = filteredOptions.findIndex(op => op.type === 'paths')

      if (firstMemberIndex >= 0) {
        filteredOptions[firstMemberIndex].includeHeader = true
      }
      if (firstFilenameIndex >= 0) {
        filteredOptions[firstFilenameIndex].includeHeader = true
      }
      if (firstPathIndex >= 0) {
        filteredOptions[firstPathIndex].includeHeader = true
      }

      return filteredOptions
    })

    const selectedAllOptions: Ref<GenericFilterOptionType[]> = computed(() => {
      return [
        ...props.selectedPositiveMembers.map(membershipToOption),
        ...props.selectedNegativeMembers.map(membershipToOption),
        ...props.selectedPositiveFolders.map(f => folderToOptionV2(f, props.dataset)),
        ...props.selectedNegativeFolders.map(f => folderToOptionV2(f, props.dataset)),
        ...props.selectedPositiveFilenames.map(filenameToOption),
        ...props.selectedNegativeFilenames.map(filenameToOption)
      ]
    })

    const selectedPositiveOptions: Ref<GenericFilterOptionType[]> = computed(() => {
      return [
        ...props.selectedPositiveMembers.map(membershipToOption),
        ...props.selectedPositiveFolders.map(f => folderToOptionV2(f, props.dataset)),
        ...props.selectedPositiveFilenames.map(filenameToOption)
      ]
    })

    const selectedNegativeOptions: Ref<GenericFilterOptionType[]> = computed(() => {
      return [
        ...props.selectedNegativeMembers.map(membershipToOption),
        ...props.selectedNegativeFolders.map(f => folderToOptionV2(f, props.dataset)),
        ...props.selectedNegativeFilenames.map(filenameToOption)
      ]
    })

    watch(() => props.keyword, () => {
      searchValue.value = props.keyword
    })

    const onSearchInput = (evt: Event): void => {
      searchValue.value = (evt.target as HTMLInputElement).value
      emit('update:keyword', searchValue.value)
      emit('search', searchValue.value)
    }

    const getOptionStatus = (option: GenericFilterOptionType): TriToggleStatus => {
      if (selectedPositiveOptions.value.find(o => o.id === option.id)) {
        return 'positive'
      } else if (selectedNegativeOptions.value.find(o => o.id === option.id)) {
        return 'negative'
      }
      return 'none'
    }

    const updateAssigneeOptionStatus = (data: MembershipPayload, status: TriToggleStatus): void => {
      const positiveIdx = props.selectedPositiveMembers.findIndex(m => m.id === data.id)
      const negativeIdx = props.selectedNegativeMembers.findIndex(m => m.id === data.id)
      const positiveMembers = [...props.selectedPositiveMembers]
      const negativeMembers = [...props.selectedNegativeMembers]

      if (status === 'positive') {
        if (positiveIdx < 0) { positiveMembers.push(data) }
        if (negativeIdx >= 0) { negativeMembers.splice(negativeIdx, 1) }
      } else if (status === 'negative') {
        if (positiveIdx >= 0) { positiveMembers.splice(positiveIdx, 1) }
        if (negativeIdx < 0) { negativeMembers.push(data) }
      } else {
        if (positiveIdx >= 0) { positiveMembers.splice(positiveIdx, 1) }
        if (negativeIdx >= 0) { negativeMembers.splice(negativeIdx, 1) }
      }

      emit('update:selectedPositiveMembers', positiveMembers)
      emit('update:selectedNegativeMembers', negativeMembers)
      emit('change', {
        positiveMembers: positiveMembers,
        negativeMembers: negativeMembers
      })
    }

    const updateFilenameOptionStatus = (
      data: DatasetItemFilenamePayload,
      status: TriToggleStatus
    ): void => {
      const positiveIdx =
        props.selectedPositiveFilenames.findIndex(m => m.filename === data.filename)
      const negativeIdx =
        props.selectedNegativeFilenames.findIndex(m => m.filename === data.filename)

      const positiveFilenames = [...props.selectedPositiveFilenames]
      const negativeFilenames = [...props.selectedNegativeFilenames]

      if (status === 'positive') {
        if (positiveIdx < 0) { positiveFilenames.push(data) }
        if (negativeIdx >= 0) { negativeFilenames.splice(negativeIdx, 1) }
      } else if (status === 'negative') {
        if (positiveIdx >= 0) { positiveFilenames.splice(positiveIdx, 1) }
        if (negativeIdx < 0) { negativeFilenames.push(data) }
      } else {
        if (positiveIdx >= 0) { positiveFilenames.splice(positiveIdx, 1) }
        if (negativeIdx >= 0) { negativeFilenames.splice(negativeIdx, 1) }
      }

      emit('update:selectedPositiveFilenames', positiveFilenames)
      emit('update:selectedNegativeFilenames', negativeFilenames)
      emit('change', {
        positiveFilenames: positiveFilenames,
        negativeFilenames: negativeFilenames
      })
    }

    const updateFolderOptionStatus = (
      data: V2DatasetFolderPayload,
      status: TriToggleStatus
    ): void => {
      const positiveIdx = props.selectedPositiveFolders.findIndex(m => m.path === data.path)
      const negativeIdx = props.selectedNegativeFolders.findIndex(m => m.path === data.path)
      const positiveFolders = [...props.selectedPositiveFolders]
      const negativeFolders = [...props.selectedNegativeFolders]

      if (status === 'positive') {
        if (positiveIdx < 0) { positiveFolders.push(data) }
        if (negativeIdx >= 0) { negativeFolders.splice(negativeIdx, 1) }
      } else if (status === 'negative') {
        if (positiveIdx >= 0) { positiveFolders.splice(positiveIdx, 1) }
        if (negativeIdx < 0) { negativeFolders.push(data) }
      } else {
        if (positiveIdx >= 0) { positiveFolders.splice(positiveIdx, 1) }
        if (negativeIdx >= 0) { negativeFolders.splice(negativeIdx, 1) }
      }

      emit('update:selectedPositiveFolders', positiveFolders)
      emit('update:selectedNegativeFolders', negativeFolders)
      emit('change', {
        positiveFolders: positiveFolders,
        negativeFolders: negativeFolders
      })
    }

    const updateOptionStatus = (option: GenericFilterOptionType, status: TriToggleStatus): void => {
      switch (option.type) {
      case 'assignees':
        updateAssigneeOptionStatus(option.data as MembershipPayload, status)
        break
      case 'filenames':
        updateFilenameOptionStatus(option.data as DatasetItemFilenamePayload, status)
        break
      case 'paths': {
        updateFolderOptionStatus(option.data as V2DatasetFolderPayload, status)
        break
      }
      }
    }

    const toggleOption = (
      params: { option: GenericFilterOptionType, status: TriToggleStatus }
    ): void => {
      const { option, status } = params
      updateOptionStatus(option, status)
      searchValue.value = ''
      emit('update:keyword', searchValue.value)
      emit('search', searchValue.value)
    }

    const shiftToggleOption = (
      params: { option: GenericFilterOptionType, status: TriToggleStatus }
    ): void => {
      const { option, status } = params
      updateOptionStatus(option, status)
    }

    const deselectOption = (option: GenericFilterOptionType): void => {
      updateOptionStatus(option, 'none')
    }

    return {
      filteredOptions,
      selectedAllOptions,
      searchValue,
      onSearchInput,
      getOptionStatus,
      updateOptionStatus,
      toggleOption,
      shiftToggleOption,
      deselectOption
    }
  }
})
</script>

<style lang="scss" scoped>
.input-wrapper {
  max-width: 100%;
  flex-grow: 1;
  display: flex;
  :deep(svg) {
    margin-left: 4px;
    margin-top: 3px;
  }
}

.generic-filter--loading {
  // This is hidden by default when loading is false
  // The problem is that when loading is true, the dropdown is hidden
  // We need to show this dropdown always so make this always visible
  :deep(.vs__spinner) {
    display: block !important;
    opacity: 1;
  }
}

.generic-filter {
  width: 100%;
  height: auto;
  padding: 2px;
  position: relative;
  border: 1px solid $colorStrokeStrong;

  &.vs--open {
    box-shadow: 0 0 0 1.5px $colorInteractivePrimaryDefault;
  }

  :deep(.vs__dropdown-toggle) {
    padding: 0;

    input {
      &.vs__search::placeholder {
        color: $colorNeutralsLight600;
      }

      &.vs__search {
        display: block;
        @include typography(md-1, inter, 500);
        color: $colorContentEmphasis;
      }

      &.vs__search::placeholder {
        @include typography(md-1, inter, 500);
      }
    }
  }

  :deep(.vs__actions) {
    height: 32px;

    .vs__open-indicator {
      display: none;
    }
  }

  :deep(.vs__selected-options) {
    align-items: center;
    padding: 6px;
  }

  :deep(.vs__dropdown-menu) {
    padding: 0 0 8px 0;
    margin-top: 8px;
    border: 1px solid $colorNeutralsLight300;
    box-shadow: $effectShadowsXS;
    border-radius: 12px;
  }

  :deep(.vs__dropdown-option) {
    padding: 0;
    margin: 0;

    &.vs__dropdown-option--highlight {
      background: transparent;
    }
  }
}

.generic-filter__no-option {
  // Already 8px padding bottom was set, so just 16px
  padding: 24px 0 16px 0;
  color: $colorContentSecondary;
  @include typography(md, inter, 500);
}
</style>
