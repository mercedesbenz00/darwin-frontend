<template>
  <div
    class="discard"
    v-tooltip="tooltip"
    v-click-outside="onClose"
  >
    <custom-button
      class="discard__button"
      variant="outline"
      size="small"
      flair="rounded"
      @click="onOpen"
    >
      {{ skippedReason || 'Discard' }}
      <template #suffix-icon>
        <dropdown-icon />
      </template>
    </custom-button>
    <popup-menu
      v-if="open"
      class="popup-menu popup-menu-discard-button"
      :class="{ 'popup-menu--open': open }"
    >
      <list-element-v2
        v-for="(reason, idx) of skipReasons"
        :key="reason.value"
        :id="reason.value"
        :text="reason.text"
        :selected="selectedIdx === idx"
        :active="reason.value === skippedReason"
        @click="onSkip(reason)"
      />
    </popup-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  ref,
  Ref,
  SetupContext
} from 'vue'

import { CustomButton, DropdownIcon } from '@/components/Common/Button/V2'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { useHotkeysNavigation } from '@/composables'
import { SkippedReason } from '@/store/types'
import { TooltipOptions } from '@/types'
import { getIdNext } from '@/utils'

type SkipReason = {
  text: string
  value: string
}

export default defineComponent({
  name: 'DiscardButton',
  components: {
    CustomButton,
    DropdownIcon,
    ListElementV2,
    PopupMenu
  },
  props: {
    skippedReason: { required: false, default: null, type: String as PropType<SkippedReason> }
  },
  setup (props, { emit }: SetupContext) {
    const skipReasons: SkipReason[] = [
      { text: 'Motion Blur', value: 'Motion Blur' },
      { text: 'Out of Focus', value: 'Out of Focus' },
      { text: 'Occluded', value: 'Occluded/Out of Frame' },
      { text: 'No Object', value: 'No Object' },
      { text: 'Not Qualified', value: 'Not Qualified' },
      { text: 'Other', value: 'Other' }
    ]
    const open: Ref<boolean> = ref(false)
    const selectedIdx: Ref<number> = ref(0)

    const tooltip = computed((): TooltipOptions => {
      return {
        content: props.skippedReason
          ? 'Update discarding of image'
          : 'Discard image',
        delay: { show: 300, hide: 300 }
      }
    })

    const onOpen = (): void => {
      setTimeout(() => {
        emit(open.value ? 'close' : 'open')
        open.value = !open.value
      }, 100)
    }

    const onClose = (): void => {
      setTimeout(() => {
        emit('close')
        open.value = false
      }, 100)
    }

    const onSkip = (selected: SkipReason): void => {
      selectedIdx.value = skipReasons.findIndex(({ value }) => value === selected.value)
      emit('toggle-skip', selected.value)
      onClose()
    }

    useHotkeysNavigation({
      name: 'discard button',
      condition: open,
      handlers: {
        increase: () => {
          const newId = getIdNext(selectedIdx.value, skipReasons.length, true)
          selectedIdx.value = newId
          emit('input', skipReasons[newId])
        },
        decrease: () => {
          const newId = getIdNext(selectedIdx.value, skipReasons.length, false)
          selectedIdx.value = newId
          emit('input', skipReasons[newId])
        },
        submit: () => {
          onSkip(skipReasons[selectedIdx.value])
        },
        close: () => {
          onClose()
        }
      }
    })

    return {
      skipReasons,
      open,
      selectedIdx,
      tooltip,
      onOpen,
      onClose,
      onSkip
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-discard-button {
  .menu__wrapper {
    @include col;

    .list-element {
      &__content:hover {
        background-color: transparent;
      }

      &:hover:not(:disabled) {
        background-color: $colorSurfaceElevate;
      }

      &[data-selected="true"] {
        outline: 1px solid $colorNeutrals300;

        &:not([data-active="true"]) {
          &,
          &:hover:not(:disabled) {
            background-color: transparent;
          }
        }
      }

      &[data-active="true"]:not([data-selected="true"]) {
        &,
        &:hover:not(:disabled) {
          background-color: $colorOverlayInteractive !important;
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
$max-height: 230px;
$popup-width: 230px;
$min-popup-height: 30px;
$max-popup-height: 420px;

.discard {
  position: relative;

  .popup-menu {
    display: none;
    @include col;
    justify-content: space-between;
    position: absolute;
    right: 0;
    margin: 0;
    padding: 0;
    width: $popup-width;
    height: auto;
    min-height: $min-popup-height;
    max-height: $max-popup-height;
    background-color: $colorWhite;
    z-index: 1;
    @include scrollbarV2;

    &--open {
      display: block;
    }
  }
}
</style>
