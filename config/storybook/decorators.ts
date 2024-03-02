import PrimaryButton from '@/components/Common/Button/V1/PrimaryButton.vue'

/**
 * Renders component inside a minimal modal, with a button to open the modal
 *
 * Should be used for components where there's uncertainty or danger of them
 * breaking inside a modal. For example, with `Dropdown` or `vue-tags-input`.
 */
export const Modal = () => ({
  components: { PrimaryButton },
  template: `
    <div>
      <modal name="decorativeModal" height="auto">
        <div style="padding: 20px;">
          <story />
        </div>
      </modal>
      <green-button @click="$modal.show('decorativeModal')">Open Modal</green-button>
    </div>
  `
})

/**
 * Renders component inside a minimal modal, with a button to open the modal and
 * overflow-y set to scroll on the modal.
 *
 * Should be used for components where there's uncertainty or danger of them
 * breaking inside a scrollable modal. For example, with `Dropdown` or
 * `vue-tags-input`.
 */
export const ModalWithScroll = () => ({
  components: { PrimaryButton },
  template: `
    <div>
      <modal name="decorativeModal" height="100px" scrollable :click-to-close="false">
        <div style="padding: 20px;">
          <story />
        </div>
      </modal>
      <primary-button @click="$modal.show('decorativeModal')">Open Modal</primary-button>
    </div>
  `
})
