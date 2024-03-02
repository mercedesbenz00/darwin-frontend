<template>
  <div class="sort-dropdown">
    <div
      class="sort-dropdown__input"
      :class="{ 'sort-dropdown__input--disabled': disabled }"
    >
      <select-field
        :value="sel"
        :options="options"
        :disabled="disabled"
        :custom="true"
        :required="true"
        :emit-on-navigation="emitOnNavigation"
        @input="onInput($event)"
      >
        <template #label>
          Sort by&nbsp;<span style="text-transform: lowercase;">{{ selected }}</span>
        </template>
        <template #icon>
          <sort-button
            class="sort-dropdown__direction"
            :direction="direction"
            @update:direction="onDirectionChange"
          />
        </template>
      </select-field>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, SetupContext } from 'vue'

import SelectField from '@/components/Common/SelectField/V2/SelectField.vue'
import SortButton from '@/components/Common/SortButton/V2/SortButton.vue'
import { DropdownOption } from '@/components/Common/SortDropdown/types'

const directionValidator = (val: string): boolean => ['asc', 'desc'].includes(val)

export default defineComponent({
  name: 'SortDropdown',
  components: {
    SelectField,
    SortButton
  },
  props: {
    value: { required: true, type: [String, Number] },
    options: { required: true, type: Array as PropType<DropdownOption[]> },
    size: { default: 'normal', type: String as PropType<'small' | 'normal'> },
    direction: {
      default: 'asc',
      type: String as PropType<'asc' | 'desc'>,
      validator: directionValidator
    },
    disabled: { default: false, type: Boolean },
    emitOnNavigation: { default: true, type: Boolean },
  },
  setup (props, { emit }: SetupContext) {
    const isDirectionAsc = computed((): boolean => {
      return props.direction === 'asc'
    })

    const sel = computed((): string | number => {
      return props.value
    })

    const selected = computed((): string => {
      const option: DropdownOption | undefined = props.options
        .find(({ id }) => id === sel.value) || prsop.options[0]
      if (!option) { return '' }
      const { text } = option
      return text
    })

    const onInput = (option: DropdownOption): void => {
      emit('input', option.id)
      emit('change', option.id)
    }

    const onDirectionChange = (): void => {
      emit('change-direction', props.direction === 'asc' ? 'desc' : 'asc')
    }

    return {
      isDirectionAsc,
      sel,
      selected,
      onInput,
      onDirectionChange
    }
  }
})
</script>

<style lang="scss" scoped>
.sort-dropdown {
  position: relative;
  @include row;
}
</style>
