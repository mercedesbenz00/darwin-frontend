<template>
  <modal-v2
    :name="name"
    size="medium"
    :width="388"
    transition="pop-out"
    height="auto"
    :min-width="200"
    :max-width="388"
    :classes="['confirm']"
    :click-to-close="clickToClose"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <modal-content-v2>
      <slot />
      <div class="confirm__title">
        {{ title }}
      </div>
      <div class="confirm__description">
        {{ detail }}
      </div>
      <div class="confirm__footer">
        <custom-button
          class="btn-positive"
          size="medium"
          flair="rounded"
          variant="outline"
          @click.stop.prevent="cancel"
        >
          {{ cancelButtonText }}
        </custom-button>

        <custom-button
          class="btn-negative"
          size="medium"
          flair="rounded"
          :color="confirmButtonColor"
          @click.stop.prevent="confirm"
        >
          {{ buttonText }}
        </custom-button>
      </div>
    </modal-content-v2>
  </modal-v2>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import { useModal, useStore } from '@/composables'

/**
 * Wrapper around a vue-js-modal used for simple confirm/cancel dialogs.
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
export default defineComponent({
  name: 'ConfirmationDialog',
  components: {
    CustomButton,
    ModalV2,
    ModalContentV2
  },
  props: {
    title: {
      required: true,
      type: String
    },
    detail: {
      required: true,
      type: String
    },
    buttonText: {
      required: false,
      type: String,
      default: 'Okey'
    },
    confirmButtonColor: {
      required: false,
      type: String,
      default: 'primary'
    },
    cancelButtonText: {
      required: false,
      type: String,
      default: 'Cancel'
    },
    name: {
      required: false,
      type: String,
      default: 'confirm-dialog'
    },
    loading: {
      required: false,
      type: Boolean,
      default: false
    },
    clickToClose: {
      required: false,
      type: Boolean,
      default: true
    }
  },
  setup (props, { emit }) {
    const store = useStore()
    const modal = useModal()

    const onBeforeOpen = (): void => {
      store.dispatch('ui/putBackSidebar')
    }

    const onClosed = (): void => {
      store.dispatch('ui/bringFrontSidebar')
    }

    const show = (): void => {
      modal.show(props.name)
    }

    const close = (): void => {
      modal.hide(props.name)
    }

    const cancel = (): void => {
      emit('canceled')
      close()
    }

    const confirm = (): void => {
      emit('confirmed')
    }

    return {
      onBeforeOpen,
      onClosed,
      show,
      close,
      cancel,
      confirm
    }
  }
})
</script>

<style lang="scss" scoped>
.confirm__title {
  @include typography(xl, inter, 500);
  @include row--center;
  color: $colorContentDefault;

  margin-top: 16px;
  width: 100%;
}

.confirm__description {
  @include typography(lg, inter, 500);
  @include row--center;
  color: $colorContentSecondary;

  margin-top: 8px;
  margin-bottom: 16px;
  width: 100%;
  display: flex;
}

.confirm__footer {
  padding-top: 16px;
  width: 100%;
  display: flex;
  gap: 8px;
  justify-content: space-between;

  .btn-positive, .btn-negative {
    width: 100% !important;
  }
}
</style>
