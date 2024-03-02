<template>
  <div class="comment-profile">
    <avatar
      :id="author.id"
      class="comment-profile__avatar"
      :name="fullName"
      :url="author.image && (author.image.thumbnail_url || author.image.url)"
      :size="25"
    />
    <div class="comment-profile__name">
      {{ fullName }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import { MembershipPayload } from '@/store/types'
import { V2CommentPayload } from '@/store/types'

export default defineComponent({
  name: 'CommentProfile',
  components: { Avatar },
  props: {
    author: {
      type: Object as () => MembershipPayload,
      required: true
    },
    comment: {
      type: Object as () => V2CommentPayload,
      required: false,
      default: () => ({})
    }
  },
  setup (props) {
    const fullName = computed(() => props.comment.created_by_system
      ? 'System User'
      : `${props.author.first_name} ${props.author.last_name}`)
    return { fullName }
  }
})

</script>

<style lang="scss" scoped>
.comment-profile {
  width: 100%;
  @include row;
  align-items: center;
}

.comment-profile__avatar {
  margin-right: 9px;
}

.comment-profile__name {
  @include typography(md-1, default, bold);
  color: $colorSecondaryDark;
}
</style>
