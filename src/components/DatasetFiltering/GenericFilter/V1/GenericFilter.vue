<template>
  <dropdown
    class="generic-filter"
    :class="{ 'generic-filter--loading': loading }"
    multiple
    placeholder="Search or filter"
    theme="dark"
    filterable
    :options="filteredOptions"
    :value="selectedAllOptions"
  >
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
    <template #search="{ attributes, events }">
      <input
        class="vs__search"
        v-bind="attributes"
        :value="searchValue"
        v-on="events"
        @input="onSearchInput"
      >
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import Dropdown from '@/components/Common/Dropdown/V2/Dropdown.vue'
import {
  GenericFilterOptionType,
  membershipToOption,
  folderToOption,
  filenameToOption,
  GenericFilterOption,
  GenericFilterSelectedOption
} from '@/components/DatasetFiltering/GenericFilter'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetPayload,
  MembershipPayload
} from '@/store/types'
import { TriToggleStatus } from '@/utils'

const isOptionMatch = (option: GenericFilterOptionType, search: string): boolean => {
  return (option.label || '').toLowerCase().indexOf(search.toLowerCase()) > -1
}

@Component({
  name: 'generic-filter',
  components: { Dropdown, GenericFilterOption, GenericFilterSelectedOption }
})
export default class GenericFilter extends Vue {
  @Prop({ required: true, type: String })
  keyword!: string

  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Array as () => MembershipPayload[] })
  members!: MembershipPayload[]

  @Prop({ required: true, type: Array as () => MembershipPayload[] })
  selectedPositiveMembers!: MembershipPayload[]

  @Prop({ required: true, type: Array as () => MembershipPayload[] })
  selectedNegativeMembers!: MembershipPayload[]

  @Prop({ required: true, type: Array as () => DatasetFolderPayload[] })
  folders!: DatasetFolderPayload[]

  @Prop({ required: true, type: Array as () => DatasetFolderPayload[] })
  selectedPositiveFolders!: DatasetFolderPayload[]

  @Prop({ required: true, type: Array as () => DatasetFolderPayload[] })
  selectedNegativeFolders!: DatasetFolderPayload[]

  @Prop({ required: true, type: Array as () => DatasetItemFilenamePayload[] })
  filenames!: DatasetItemFilenamePayload[]

  @Prop({ required: true, type: Array as () => DatasetItemFilenamePayload[] })
  selectedPositiveFilenames!: DatasetItemFilenamePayload[]

  @Prop({ required: true, type: Array as () => DatasetItemFilenamePayload[] })
  selectedNegativeFilenames!: DatasetItemFilenamePayload[]

  @Prop({ required: false, type: Boolean, default: false })
  loading!: boolean

  get options (): GenericFilterOptionType[] {
    // When filename is empty, `filenames` is empty as well.
    // When `selectedFilenames` is not empty, we should show them as options
    // That's why we need to merge `filenames` with `selectedFilenames`
    const possibleFilenames = uniq([
      ...this.filenames,
      ...this.selectedPositiveFilenames,
      ...this.selectedNegativeFilenames
    ])
    return [
      ...this.members.map(membershipToOption),
      ...this.folders.map(f => folderToOption(f, this.dataset)),
      ...possibleFilenames.map(filenameToOption)
    ]
  }

  get filteredOptions (): GenericFilterOptionType[] {
    const filteredOptions = this.options.filter(op => isOptionMatch(op, this.searchValue))

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
  }

  get selectedAllOptions (): GenericFilterOptionType[] {
    return [
      ...this.selectedPositiveMembers.map(membershipToOption),
      ...this.selectedNegativeMembers.map(membershipToOption),
      ...this.selectedPositiveFolders.map(f => folderToOption(f, this.dataset)),
      ...this.selectedNegativeFolders.map(f => folderToOption(f, this.dataset)),
      ...this.selectedPositiveFilenames.map(filenameToOption),
      ...this.selectedNegativeFilenames.map(filenameToOption)
    ]
  }

  get selectedPositiveOptions (): GenericFilterOptionType[] {
    return [
      ...this.selectedPositiveMembers.map(membershipToOption),
      ...this.selectedPositiveFolders.map(f => folderToOption(f, this.dataset)),
      ...this.selectedPositiveFilenames.map(filenameToOption)
    ]
  }

  get selectedNegativeOptions (): GenericFilterOptionType[] {
    return [
      ...this.selectedNegativeMembers.map(membershipToOption),
      ...this.selectedNegativeFolders.map(f => folderToOption(f, this.dataset)),
      ...this.selectedNegativeFilenames.map(filenameToOption)
    ]
  }

  searchValue: string = ''

  @Watch('keyword')
  onKeyword (): void {
    this.searchValue = this.keyword
  }

  onSearchInput (evt: Event): void {
    this.searchValue = (evt.target as HTMLInputElement).value
    this.$emit('update:keyword', this.searchValue)
    this.$emit('search', this.searchValue)
  }

  getOptionStatus (option: GenericFilterOptionType): TriToggleStatus {
    if (this.selectedPositiveOptions.find(o => o.id === option.id)) {
      return 'positive'
    } else if (this.selectedNegativeOptions.find(o => o.id === option.id)) {
      return 'negative'
    }
    return 'none'
  }

  toggleOption (params: { option: GenericFilterOptionType, status: TriToggleStatus }): void {
    const { option, status } = params
    this.updateOptionStatus(option, status)
    this.searchValue = ''
    this.$emit('update:keyword', this.searchValue)
    this.$emit('search', this.searchValue)
  }

  shiftToggleOption (params: { option: GenericFilterOptionType, status: TriToggleStatus }): void {
    const { option, status } = params
    this.updateOptionStatus(option, status)
  }

  deselectOption (option: GenericFilterOptionType): void {
    this.updateOptionStatus(option, 'none')
  }

  updateOptionStatus (option: GenericFilterOptionType, status: TriToggleStatus): void {
    switch (option.type) {
    case 'assignees':
      this.updateAssigneeOptionStatus(option.data as MembershipPayload, status)
      break
    case 'filenames':
      this.updateFilenameOptionStatus(option.data as DatasetItemFilenamePayload, status)
      break
    case 'paths': {
      this.updateFolderOptionStatus(option.data as DatasetFolderPayload, status)
      break
    }
    }
  }

  updateAssigneeOptionStatus (data: MembershipPayload, status: TriToggleStatus): void {
    const positiveIdx = this.selectedPositiveMembers.findIndex(m => m.id === data.id)
    const negativeIdx = this.selectedNegativeMembers.findIndex(m => m.id === data.id)

    if (status === 'positive') {
      if (positiveIdx < 0) { this.selectedPositiveMembers.push(data) }
      if (negativeIdx >= 0) { this.selectedNegativeMembers.splice(negativeIdx, 1) }
    } else if (status === 'negative') {
      if (positiveIdx >= 0) { this.selectedPositiveMembers.splice(positiveIdx, 1) }
      if (negativeIdx < 0) { this.selectedNegativeMembers.push(data) }
    } else {
      if (positiveIdx >= 0) { this.selectedPositiveMembers.splice(positiveIdx, 1) }
      if (negativeIdx >= 0) { this.selectedNegativeMembers.splice(negativeIdx, 1) }
    }

    this.$emit('change', {
      positiveMembers: this.selectedPositiveMembers,
      negativeMembers: this.selectedNegativeMembers
    })
  }

  updateFilenameOptionStatus (data: DatasetItemFilenamePayload, status: TriToggleStatus): void {
    const positiveIdx = this.selectedPositiveFilenames.findIndex(m => m.filename === data.filename)
    const negativeIdx = this.selectedNegativeFilenames.findIndex(m => m.filename === data.filename)

    if (status === 'positive') {
      if (positiveIdx < 0) { this.selectedPositiveFilenames.push(data) }
      if (negativeIdx >= 0) { this.selectedNegativeFilenames.splice(negativeIdx, 1) }
    } else if (status === 'negative') {
      if (positiveIdx >= 0) { this.selectedPositiveFilenames.splice(positiveIdx, 1) }
      if (negativeIdx < 0) { this.selectedNegativeFilenames.push(data) }
    } else {
      if (positiveIdx >= 0) { this.selectedPositiveFilenames.splice(positiveIdx, 1) }
      if (negativeIdx >= 0) { this.selectedNegativeFilenames.splice(negativeIdx, 1) }
    }

    this.$emit('change', {
      positiveFilenames: this.selectedPositiveFilenames,
      negativeFilenames: this.selectedNegativeFilenames
    })
  }

  updateFolderOptionStatus (data: DatasetFolderPayload, status: TriToggleStatus): void {
    const positiveIdx = this.selectedPositiveFolders.findIndex(m => m.path === data.path)
    const negativeIdx = this.selectedNegativeFolders.findIndex(m => m.path === data.path)

    if (status === 'positive') {
      if (positiveIdx < 0) { this.selectedPositiveFolders.push(data) }
      if (negativeIdx >= 0) { this.selectedNegativeFolders.splice(negativeIdx, 1) }
    } else if (status === 'negative') {
      if (positiveIdx >= 0) { this.selectedPositiveFolders.splice(positiveIdx, 1) }
      if (negativeIdx < 0) { this.selectedNegativeFolders.push(data) }
    } else {
      if (positiveIdx >= 0) { this.selectedPositiveFolders.splice(positiveIdx, 1) }
      if (negativeIdx >= 0) { this.selectedNegativeFolders.splice(negativeIdx, 1) }
    }

    this.$emit('change', {
      positiveFolders: this.selectedPositiveFolders,
      negativeFolders: this.selectedNegativeFolders
    })
  }
}
</script>

<style lang="scss" scoped>
.generic-filter {
  width: 100%;
  height: auto;
  min-height: 36px;
  position: relative;

  :deep(.vs__dropdown-toggle) {
    padding: 2px 0;
    overflow-y: auto;

    input.vs__search {
      display: block;
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
  }

  :deep(.vs__dropdown-menu) {
    padding: 3px 0;
  }

  :deep(.vs__dropdown-option) {
    padding: 2px 0;

    &.vs__dropdown-option--highlight {
      background: transparent;
      padding: 2px 0;
    }
  }
}

:deep(.generic-filter--loading) {
  // This is hidden by default when loading is false
  // The problem is that when loading is true, the dropdown is hidden
  // We need to show this dropdown always so make this always visible
  .vs__spinner {
    display: block !important;
    opacity: 1;
  }
}

.generic-filter__no-option {
  padding: 3px 0;
  color: $colorAliceNight;
  @include typography(sm, mulish);
}
</style>
