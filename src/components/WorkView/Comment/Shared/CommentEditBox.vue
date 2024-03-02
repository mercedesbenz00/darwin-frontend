<template>
  <mentionable
    v-click-outside="onClickOutside"
    insert-space
    offset="6"
    popover-class="popover-mention"
    :keys="['@']"
    :items="members"
    @open="openMentionable"
    @close="closeMentionable"
  >
    <textarea-autosize
      ref="commentBody"
      v-model="body"
      class="textarea"
      :placeholder="placeholder"
      :min-height="minHeight"
      :max-height="maxHeight"
      @keydown="onKeyDown"
    />

    <template #no-result>
      <div class="comment-edit-box__no-members">
        No result
      </div>
    </template>

    <template #item="{ item }">
      <div class="comment-edit-box__member">
        <team-member-avatar
          class="comment-edit-box__member__avatar"
          :member="item"
          :size="20"
        />
        <span>{{ item.first_name }} {{ item.last_name }}</span>
      </div>
    </template>
  </mentionable>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Mentionable } from 'vue-mention'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/TeamMemberAvatar.vue'
import TextareaAutosize from '@/components/Common/TextareaAutosize.vue'
import { useStore } from '@/composables/useStore'
import { MembershipPayload } from '@/store/types'
import { commentToHtml, htmlToComment } from '@/utils'

type MentionItem = MembershipPayload & { value: string }

export default defineComponent({
  name: 'CommentEditBox',
  components: { Mentionable, TeamMemberAvatar, TextareaAutosize },
  props: {
    value: { type: String, required: false, default: '' },
    placeholder: { type: String, required: false, default: 'Reply' },
    minHeight: { type: Number, required: false, default: 15 },
    maxHeight: { type: Number, required: false, default: 350 },
    focus: { type: Boolean, required: false, default: false }
  },
  setup (props, { emit }) {
    const store = useStore()
    const memberships: MembershipPayload[] = store.getters['team/relevantTeamMemberships']

    const commentBody = ref<TextareaAutosize | null>(null)

    const focusTextArea = (): void => {
      if (!commentBody.value) { return }
      ((commentBody.value.$el as HTMLElement).focus())
    }

    const blurTextArea = (): void => {
      if (!commentBody.value) { return }
      ((commentBody.value.$el as HTMLElement).blur())
    }

    const setFocus = (): void => {
      props.focus ? focusTextArea() : blurTextArea()
    }

    watch(() => props.focus, setFocus)

    onMounted(() => setFocus())

    const isMentionableOpen = ref<boolean>(false)

    const body = computed<string>({
      get: () => commentToHtml(props.value),
      set: (value: string) => emit('input', htmlToComment(value))
    })

    const members = computed<MentionItem[]>(
      () => memberships.map(member => ({ ...member, value: member.first_name }))
    )

    const onClickOutside = (evt: MouseEvent): void => {
      // Check if mention item clicked or not.
      const clickedMentionItem = evt.composedPath().find((pathTarget) => {
        if (!(pathTarget instanceof HTMLElement)) { return false }
        return pathTarget.classList.contains('mention-item')
      })

      if (!clickedMentionItem) {
        emit('click-outside')
      }
    }

    const onKeyDown = (evt: KeyboardEvent): void => {
      if (isMentionableOpen.value) { return }
      evt.stopPropagation()

      if (evt.key === 'Escape') {
        emit('cancel')
      }

      if (evt.key === 'Enter' && !evt.shiftKey) {
        emit('enter')
        evt.preventDefault()
      }
    }

    const openMentionable = (): void => { isMentionableOpen.value = true }
    const closeMentionable = (): void => { isMentionableOpen.value = false }

    return {
      body,
      commentBody,
      members,
      onClickOutside,
      onKeyDown,
      openMentionable,
      closeMentionable
    }
  }
})
</script>

<style lang="scss" scoped>
.textarea {
  width: 100%;
  @include typography(md, default);
  line-height: 20px;
  color: $color90Black;
  border: none;
  outline: none;

  // style for placeholder
  @include contenteditable-placeholder {
    @include typography(md, default);
    line-height: 20px;
    color: $colorAliceNight;
  }
}

.comment-edit-box__no-members {
  color: $color90Black;
  padding: 5px 10px;
}

.comment-edit-box__member {
  @include row;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background-color: $colorAliceBlue;
  }

  &:active {
    background-color: $colorAliceShade;
  }
}

.comment-edit-box__member__avatar {
  margin-right: 5px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover-mention {
  .popover-inner {
    background: $colorWhite;
    color: $color90Black;
    border: 1px solid rgba(241, 245, 249, 0.3);
    padding: 0;

    .mention-item {
      &:first-child {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }

      &:last-child {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }

    .mention-selected {
      background-color: $colorAliceBlue;
    }
  }
}
</style>
