<template>
  <section class="message">
    <Avatar
      v-if="author"
      :id="author.id"
      class="message__avatar"
      :name="fullName"
      :url="authorImageUrl"
      :size="25"
    />

    <div class="message__content">
      <h4
        class="message__title"
      >
        {{ name }} <time class="mute">Just now</time>
      </h4>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing
        elit. Accusamus, quis facilis? Quia rem,
        delectus vitae at molestias aut, deleniti laudantium illum aliquid harum inventore? Rem
        accusantium nesciunt quam a similique!
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import Avatar from '@/components/Common/Avatar/V2/Avatar.vue'
import { useStore, useGetUser } from '@/composables'
import { MembershipPayload } from '@/store/types'

export default defineComponent({
  name: 'Message',
  components: { Avatar },
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
      author,
      name,
      fullName,
      authorImageUrl
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.message {
  padding: $spacing-4;
  background-color: $colorSurfaceElevate;
  border-radius: $borderRadius3;
  display: flex;
  justify-content: space-between;
  align-content: start;
  gap: $spacing-3;

  &__title {
    @include typographyRegularBody25;
    margin-bottom: $spacing-3;
  }

  &__avatar {
    align-self: start;
  }

  &__content {
    p {
      @include typographyRegularBody100;
    }
  }
}

.mute {
  color: $colorContentTertiary;
}
</style>
