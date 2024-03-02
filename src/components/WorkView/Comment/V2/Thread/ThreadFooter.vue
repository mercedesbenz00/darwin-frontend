<template>
  <footer class="footer">
    <div class="footer__content">
      <Avatar
        v-if="author"
        :id="author.id"
        class="comment-profile__avatar"
        :name="fullName"
        :url="authorImageUrl"
        :size="25"
      />

      <p v-tooltip="{ content: fullName }">
        <span class="mute">Created by</span> {{ name }}
      </p>
    </div>

    <DarwinButton
      class="resolve-btn"
      kind="outline"
      size="sm"
      v-tooltip="{ content: 'Resolve' }"
    >
      <IconMonoCentroid />
    </DarwinButton>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { IconMonoCentroid } from '@/assets/icons/V2/Mono'
import Avatar from '@/components/Common/Avatar/V2/Avatar.vue'
import { useGetUser, useStore } from '@/composables'
import { MembershipPayload } from '@/store/types'
import DarwinButton from '@/uiKit/Button/DarwinButton.vue'

export default defineComponent({
  name: 'InputForm',
  components: {
    Avatar,
    DarwinButton,
    IconMonoCentroid
  },
  props: {
    authorId: {
      type: Number,
      required: true
    },
  },
  setup (props) {
    const { state } = useStore()
    const { getUser, getUserAvatar, getUserFullName } = useGetUser()

    const teamId = computed(() => state.team.currentTeam?.id)

    const author = computed<MembershipPayload | null>(() => {
      if (!teamId.value) { return null }
      return getUser(teamId.value, props.authorId)
    })

    const name = computed(() => author.value?.first_name)
    const fullName = computed(() => author.value ? getUserFullName(author.value) : '')
    const authorImageUrl = computed(() =>
      author.value ? getUserAvatar(author.value) : null
    )

    return {
      name,
      fullName,
      author,
      authorImageUrl
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.footer, .footer__content {
  display: flex;
  align-content: center;
}

.footer {
  height: 45px;
  border-top: 1px solid $colorStrokeStrong;
  justify-content: space-between;

  @include typographyRegularBody25;
  color: $colorContentSecondary;

  &__content {
    p {
      margin-left: $spacing-2;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
  }
}

.mute {
  color: $colorContentTertiary;
}

.resolve-btn {
  align-self: center;
  border: none;
  padding: 0;
  width: 20px;
  height: 20px;
}
</style>
