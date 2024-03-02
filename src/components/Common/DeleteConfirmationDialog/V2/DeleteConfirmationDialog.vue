<template>
  <modal-v2
    :name="name"
    size="medium"
    :width="388"
    transition="pop-out"
    height="auto"
    :min-width="200"
    :max-width="388"
    :classes="['confirm-delete']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <modal-content-v2>
      <div class="confirm-delete__icon">
        <div class="confirm-delete__icon--wrapper">
          <icon-mono-warn />
        </div>
      </div>
      <div class="confirm-delete__title">
        {{ title }}
      </div>
      <div class="confirm-delete__description">
        {{ detail }}
      </div>
      <div class="confirm-delete__footer">
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
          color="negative"
          size="medium"
          flair="rounded"
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

import { IconMonoWarn } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import { useModal, useStore } from '@/composables'

/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
export default defineComponent({
  name: 'DeleteConfirmationDialog',
  components: {
    CustomButton,
    IconMonoWarn,
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
      default: 'Delete'
    },
    cancelButtonText: {
      required: false,
      type: String,
      default: 'Cancel'
    },
    name: {
      required: false,
      type: String,
      default: 'confirm-delete'
    },
    loading: {
      required: false,
      type: Boolean,
      default: false
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
.confirm-delete__icon {
  width: 100%;
  @include row--center;
  &--wrapper {
    @include row--center;
    background-color: $colorWarnIconWrapper;
    width: 48px;
    height: 48px;
    border-radius: 100px;
  }
}

.confirm-delete__title {
  @include typography(xl, inter, 500);
  @include row--center;
  color: $colorContentDefault;

  margin-top: 16px;
  width: 100%;
}

.confirm-delete__description {
  @include typography(lg, inter, 500);
  @include row--center;
  color: $colorContentSecondary;

  margin-top: 8px;
  margin-bottom: 16px;
  width: 100%;
  display: flex;
}

.confirm-delete__footer {
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
