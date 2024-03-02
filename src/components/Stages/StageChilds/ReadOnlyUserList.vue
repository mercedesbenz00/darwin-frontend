<template>
  <div>
    <div class="sul-scrollable__wrapper">
      <div class="sul-content__wrapper">
        <AnyoneListElement v-if="stage.config.assignable_to === 'anyone'" />
        <template v-else>
          <div>
            <UserListElement
              v-for="member in condensedMembers"
              :key="member.id"
              :member="member"
            />
            <div
              v-if="selectedMembers.length > 2"
              class="sul-content__more"
            >
              +{{ moreAnnotatorMessage }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import AnyoneListElement from '@/components/Stages/StageChilds/AnyoneListElement.vue'
import UserListElement from '@/components/Stages/StageChilds/UserListElement.vue'
import { useTeamStore } from '@/composables/useTeamStore'
import { V2AnnotateStagePayload, V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { pluralize } from '@/utils/pluralize'

export default defineComponent({
  name: 'ReadOnlyUserList',
  components: {
    AnyoneListElement,
    UserListElement,
  },
  props: {
    stage: {
      type: Object as () => V2AnnotateStagePayload | V2ReviewStagePayload,
      required: true
    }
  },
  setup (props) {
    const { allRelevantMemberships } = useTeamStore()

    const selectedMembers = computed(() =>
      allRelevantMemberships.value.filter(
        m => (props.stage.assignable_users || []).some(a => a.user_id === m.user_id)
      )
    )

    const condensedMembers = computed(() =>
      selectedMembers.value.length > 2 ? selectedMembers.value.slice(0, 2) : selectedMembers.value
    )

    const moreAnnotatorMessage = computed(() => {
      const moreCount = selectedMembers.value.length - 2

      if (moreCount > 0) {
        return pluralize(moreCount, 'more annotator', 'more annotators', true)
      }
      return null
    })

    return {
      condensedMembers,
      selectedMembers,
      moreAnnotatorMessage
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";
.sul-scrollable__wrapper {
  display: block;
  height: auto;
  max-height: 232px;
  overflow: scroll;

  @include hidden-scrollbar;
}

.sul-content__wrapper {
  display: grid;
  grid-template-rows: auto;
  grid-row-gap: 1px;
  padding: 1.5px 0;
}

.sul-content__more {
  @include typography(md, inter, 500);
  color: $colorNeutralsLight700;
  padding: $spacing-2 $spacing-4;
}
</style>
