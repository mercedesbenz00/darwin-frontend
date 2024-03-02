<template>
  <modal
    class="modal__notifications"
    :class="{ 'modal__notifications--minimized': sidebarMinimized }"
    name="modal-notifications"
    adaptive
    :width="'320px'"
    :height="'70%'"
    :max-height="600"
    :min-height="400"
  >
    <div class="modal__header modal__notifications__header">
      <div class="modal__notifications__header__title">
        Team Notifications
      </div>
      <div
        class="modal__notifications__header__settings"
        @click="openNotificationSettings"
      >
        <icon-duotone-settings class="modal__notifications__header__settings-icon" />
      </div>
    </div>
    <div class="notifications-scroll-container">
      <notification-item
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :is-oldest="!!oldestNotification && notification.id === oldestNotification.id"
      />
    </div>
  </modal>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconDuotoneSettings } from '@/assets/icons/V2/Duotone'
import NotificationItem from '@/components/Layout/Notification/NotificationItem.vue'
import { useStore } from '@/composables'
import { NotificationPayload } from '@/store/types'

export default defineComponent({
  name: 'NotificationModal',
  components: { IconDuotoneSettings, NotificationItem },
  setup () {
    const { getters, state, dispatch } = useStore()

    const sidebarMinimized = computed<boolean>(() => state.ui.sidebarMinimized)

    const notifications = computed<NotificationPayload[]>(
      () => getters['notification/notificationsForTeam']
    )
    const oldestNotification = computed<NotificationPayload | undefined>(
      () => notifications.value[notifications.value.length - 1]
    )

    const openNotificationSettings = (): void => {
      dispatch('ui/showSettingsDialog', { tab: 'notifications' })
    }
    return {
      sidebarMinimized,
      openNotificationSettings,
      notifications,
      oldestNotification
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modal__notifications {
  .v--modal {
    display: flex;
    flex-direction: column;
    position: fixed !important;
    top: 10px !important;
    left: 200px !important;
    transform: none;
    background: $colorSecondaryLight3 !important;
    box-shadow: 0px 2px 20px rgba(105, 121, 144, 0.2);
  }
}

.modal__notifications--minimized {
  .v--modal {
    left: 60px !important;
  }
}
</style>

<style lang="scss" scoped>
.modal__notifications.v--modal-overlay {
  background: none;
}

.modal__notifications__header {
  @include row--distributed;
  background: $colorSecondaryLight3;
  padding: 13px 10px 8px 10px;
}

.modal__notifications__header__title {
  @include typography(md-2, default, bold);
  letter-spacing: 0.5px;
  color: $colorSecondaryLight;
}

.modal__notifications__header__settings {
  @include row--center;
  cursor: pointer;
  border-radius: 50%;
  background-color: transparent;
  opacity: 0.5;
  width: 40px;
  height: 40px;
  margin-right: -5px;

  transition: background-color .2s ease;
  transition: opacity .2s ease;

  &:hover, &:active {
    // modal background is darker than main sidebar background
    // so hover background needs to be lighter
    background-color: $colorSecondaryLight4;
    opacity: 1;
  }
}

.modal__notifications__header__settings-icon {
  width: 22px;
  height: 22px;
  color: $colorAliceNight;
  @include noSelect;
}

.notifications-scroll-container {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
