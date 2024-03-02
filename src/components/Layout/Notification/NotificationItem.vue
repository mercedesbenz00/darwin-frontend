<template>
  <div
    v-observe-visibility="visibilityChanged"
    class="notification-item"
    :class="{
      'notification-item--read': notification.is_read,
      [`notification-item--${iconComponent}`]: true
    }"
  >
    <div
      class="notification-item__header"
      @click.prevent.stop="onClick"
    >
      <div
        v-if="shouldShowIcon"
        class="notification-item__icon"
      >
        <component :is="iconComponent" />
      </div>
      <span class="notification-item__title">{{ notification.title }}</span>
      <span class="notification-item__ago">{{ ago }}</span>
    </div>
    <div
      class="notification-item__text"
      @click.self="onClick"
      v-html="displayHtml"
    />
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import { Route } from 'vue-router'

import {
  AccountLimitReached,
  TaskApproved,
  TaskAssigned,
  TaskReadyForReview,
  TaskRejected,
  WorkAssigned,
  WorkRejected,
  WorkflowImageComment
} from '@/assets/icons/V1/notifications'
import { useModal, useStore } from '@/composables'
import { useRoute, useRouter } from '@/composables/useRouter'
import { NotificationPayload } from '@/store/types'
import {
  extractData,
  formatComment,
  formatNewDatasetVersion,
  formatPaymentFailed,
  formatWorkAssigned,
  getAgoString,
  replaceableRegex,
  workflowUrl
} from '@/utils'

export default defineComponent({
  name: 'NotificationItem',
  components: {
    AccountLimitReached,
    TaskApproved,
    TaskAssigned,
    TaskReadyForReview,
    TaskRejected,
    WorkAssigned,
    WorkRejected,
    WorkflowImageComment
  },
  props: {
    notification: {
      required: true,
      type: Object as () => NotificationPayload
    },
    isOldest: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const router = useRouter()
    const route = useRoute()
    const modal = useModal()
    const { dispatch } = useStore()
    const wasVisible = ref(false)

    const displayHtml = computed<string>(() => {
      // NOTE: Whitespace in generated html is important. Do not remove it by accident!
      switch (props.notification.type) {
      case 'account_limit_reached':
      case 'payment_failed':
        return formatPaymentFailed(props.notification)

      case 'new_dataset_version':
        return formatNewDatasetVersion(props.notification)

      case 'workflow_image_comment':
        return formatComment(props.notification)

      case 'work_assigned':
      case 'work_rejected':
        return formatWorkAssigned(props.notification)
      default:
        return props.notification.parsed
      }
    })

    const shouldShowIcon = computed<boolean>(() =>
      [
        'account_limit_reached',
        'task_approved',
        'task_assigned',
        'task_ready_for_review',
        'task_rejected',
        'work_assigned',
        'work_rejected',
        'workflow_image_comment'
      ].includes(props.notification.type)
    )

    const iconComponent = computed<string>(() => props.notification.type.replace(/_/g, '-'))

    const ago = computed<string>(() => getAgoString(props.notification.inserted_at))

    const markReadIfWasVisible = (): void => {
      if (!wasVisible.value) { return }
      if (props.notification.is_read) { return }
      dispatch('notification/markNotificationRead', props.notification.id)
    }

    onBeforeUnmount(() => {
      markReadIfWasVisible()
    })

    const handleBillingNotification = (): void => {
      const alreadyOnRoute = route.query.settings === 'plans'
      if (alreadyOnRoute) { return }
      router.push({ query: { ...route.query, settings: 'plans' } })
    }

    const handleExportNotification = (): void => {
      if (!props.notification.dataset_id) { return }
      modal.hide('modal-notifications')
      const path = `/datasets/${props.notification.dataset_id}?export`
      const alreadyOnRoute = route.path === path
      if (alreadyOnRoute) { return }
      router.push(path)
    }

    const alreadyOnRoute = (newRoute: string): boolean => route.fullPath === newRoute

    const handleWorkNotification = (): void => {
      if (!props.notification.dataset_id) { return }
      const { value: info } = extractData(props.notification, replaceableRegex('Info'))
      const firstSeq = info.split(';')[1].split(',')[0]
      const newRoute = workflowUrl(props.notification.dataset_id, firstSeq)

      if (alreadyOnRoute(newRoute)) { return }
      router.push(newRoute)
    }

    const handleWorkflowImageCommentNotification = (): void => {
      if (!props.notification.dataset_id) { return }
      const { value: seq } = extractData(props.notification, replaceableRegex('DatasetItem'))
      const newRoute = workflowUrl(props.notification.dataset_id, seq)

      if (alreadyOnRoute(newRoute)) { return }
      router.push(newRoute)
    }

    const onClick = (): Promise<Route> | void => {
      // NOTE: beforeDestroy() gets called and notifications are marked as read
      // automatically, rather than on click
      switch (props.notification.type) {
      case 'account_limit_reached':
      case 'payment_failed':
        return handleBillingNotification()

      case 'new_dataset_version':
        return handleExportNotification()

      case 'work_assigned':
      case 'work_rejected':
        return handleWorkNotification()

      case 'workflow_image_comment':
        return handleWorkflowImageCommentNotification()
      }
    }

    const visibilityChanged = (isVisible: boolean): void => {
      if (isVisible && props.isOldest) { dispatch('notification/moreNotifications') }
      wasVisible.value = isVisible
    }

    return {
      ago,
      displayHtml,
      iconComponent,
      onClick,
      shouldShowIcon,
      visibilityChanged
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.notification-item {
  background: $colorWhite;
  border-radius: 5px;
  padding: 10px;
  margin: 8px 10px;

  &:hover {
    background: #E4FCFA;
    cursor: pointer;
  }
}

.notification-item--read {
  background: #FAFCFE;
  opacity: 0.7;
}

.notification-item__header {
  display: grid;
  grid-template-columns: 15px auto auto;
  column-gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.notification-item__icon {
  height: 15px;
  width: 15px;
  display: flex;

  svg {
    max-height: 100%;
    max-width: 100%;
  }
}

.notification-item__title {
  flex: 1 1 auto;
  @include typography(md, default);
  color: $colorSecondaryLight;
}

.notification-item__ago {
  justify-content: flex-end;
  text-align: right;
  @include typography(md, default);
  color: $colorSecondaryLight;
}

.notification-item__text {
  @include typography(md, default);
  color: $colorSecondaryDark1;
}

.notification-item__bold,
.notification-item__text_link {
  @include typography(md, default, bold);
  color: $colorSecondaryDark1;
}

.notification-item__text_link:hover {
  color: $colorPrimaryLight;
}

.notification-item--task-approved {
  .notification-item__title {
    color: $colorPrimaryLight;
  }
}

.notification-item--task-assigned,
.notification-item--work-assigned {
  .notification-item__title {
    color: $colorPrimaryLight;
  }
}

.notification-item--task-ready-for-review {
  .notification-item__title {
    color: $colorYellow;
  }
}

.notification-item--account-limit-reached,
.notification-item--task-rejected,
.notification-item--work-rejected {
  .notification-item__title {
    color: $colorPink;
  }
}

</style>
