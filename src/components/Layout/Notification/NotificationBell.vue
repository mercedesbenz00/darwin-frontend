<template>
  <div>
    <div
      class="sidebar__bell"
      @click.prevent.stop="clicked"
    >
      <icon-duotone-notification-unread
        v-if="hasUnread"
        class="sidebar__bell__image"
      />
      <icon-duotone-notification-bell
        v-else
        class="sidebar__bell__image"
      />
    </div>
    <notification-modal />
  </div>
</template>

<script lang="ts">

import { computed, defineComponent } from 'vue'

import {
  IconDuotoneNotificationBell,
  IconDuotoneNotificationUnread
} from '@/assets/icons/V2/Duotone'
import NotificationModal from '@/components/Layout/Notification/NotificationModal.vue'
import { useModal, useStore } from '@/composables'

export default defineComponent({
  name: 'NotificationBell',
  components: {
    IconDuotoneNotificationBell,
    IconDuotoneNotificationUnread,
    NotificationModal
  },
  // ui props
  setup () {
    const modal = useModal()
    const store = useStore()

    const unreadCountForTeam = computed<number>(
      () => store.getters['notification/unreadCountForTeam']
    )

    const hasUnread = computed<boolean>(() => unreadCountForTeam.value > 0)

    // interaction

    const clicked = (): void => {
      modal.show('modal-notifications')
    }

    return { clicked, hasUnread }
  }

})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.sidebar__bell {
  position: relative;
  @include noSelect;
  @include row--center;
  border-radius: 50%;
  background-color: transparent;
  width: 32px;
  height: 32px;
  margin-right: -10px;
  margin-left: 5px;
  cursor: pointer;

  &:hover, &:active {
    background-color: $colorSecondaryLight3;
  }
}

.sidebar__bell__image {
  width: 18px;
  height: 20px;
}
</style>
