<template>
  <div>
    <div class="sul-input__wrapper">
      <input-field
        placeholder="Search Users"
        :value="searchValue"
        @change="setSearch"
      >
        <template #left-icon>
          <icon-mono-search />
        </template>
      </input-field>
    </div>
    <div class="sul-scrollable__wrapper">
      <div class="sul-content__wrapper">
        <anyone-list-element
          @click.native="selectAnyone"
          :selected="assignableTo === 'anyone'"
        />
      </div>
      <div
        class="sul-content__wrapper"
      >
        <user-list-element
          v-for="member in searchResults"
          :key="member.id"
          :member="member"
          :selected="isMemberSelected(member.user_id)"
          @click.native="selectMember(member)"
        />
      </div>
      <div v-if="searchValue.length > 0 && searchResults.length === 0">
        <h3 class="sul-result__label">
          No user found called „{{ searchValue }}".
        </h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import { IconMonoSearch } from '@/assets/icons/V2/Mono'
import { InputField } from '@/components/Common/InputField/V2'
import AnyoneListElement from '@/components/Stages/StageChilds/AnyoneListElement.vue'
import UserListElement from '@/components/Stages/StageChilds/UserListElement.vue'
import { searchByNameV2 } from '@/components/Stages/utils'
import { useTeamStore } from '@/composables/useTeamStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { V2AnnotateStagePayload, V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'

export default defineComponent({
  name: 'ConfigurableUserList',
  components: {
    AnyoneListElement,
    IconMonoSearch,
    InputField,
    UserListElement,
  },
  props: {
    stage: {
      type: Object as () => V2AnnotateStagePayload | V2ReviewStagePayload,
      required: true
    }
  },
  setup (props) {
    const assignableTo = ref<typeof props.stage['config']['assignable_to']>('anyone')
    const assigneeIds = ref<number[]>([])

    const { updateStageConfig, updateAssignableUsers } = useEditedWorkflow()

    const setData = (): void => {
      const assignableIds = (props.stage.assignable_users || []).map(a => a.user_id)
      assignableTo.value = props.stage.config.assignable_to
      assigneeIds.value = assignableIds
    }

    watch(() => props.stage, () => setData(), { immediate: true })

    const isMemberSelected = (id: number): boolean =>
      assigneeIds.value.some(userId => userId === id)

    const submitData = (): void => {
      updateStageConfig({
        stageId: props.stage.id,
        config: {
          assignable_to: assignableTo.value
        }
      })

      updateAssignableUsers({
        stageId: props.stage.id,
        assignable_users: assigneeIds.value.map(id => ({  user_id: id, stage_id: props.stage.id }))
      })
    }

    const selectAnyone = (): void => {
      assignableTo.value = 'anyone'
      assigneeIds.value = []
      submitData()
    }

    const selectMember = (member: MembershipPayload): void => {
      const index = assigneeIds.value.findIndex(id => id === member.user_id)

      if (index > -1) {
        assigneeIds.value.splice(index, 1)
      } else {
        assigneeIds.value.push(member.user_id)
      }

      assignableTo.value = (assigneeIds.value.length > 0) ? 'manual' : 'anyone'

      submitData()
    }

    const searchValue = ref('')

    const setSearch = (val: string): void => {
      searchValue.value = val
    }

    const { allRelevantMemberships } = useTeamStore()

    const searchResults = computed<MembershipPayload[]>(
      () => searchValue.value.length > 0
        ? searchByNameV2(allRelevantMemberships.value, searchValue.value)
        : allRelevantMemberships.value
    )

    return {
      assignableTo,
      isMemberSelected,
      searchResults,
      searchValue,
      selectAnyone,
      selectMember,
      setSearch
    }
  }
})
</script>

<style lang="scss" scoped>
.sul-input__wrapper {
  display: block;
  padding: 8px;
}

.sul-scrollable__wrapper {
  display: block;
  height: auto;
  overflow: scroll;
  padding: 0 8px 8px 8px;

  @include hidden-scrollbar;
}

.sul-content__wrapper {
  display: grid;
  grid-template-rows: auto;
  grid-row-gap: 1px;
  padding: 1.5px 0;

  &:last-child {
    border-top: 1px solid $colorNeutralsLight300;
  }
}

.sul-result__label {
  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight500;
  text-align: center;
  padding: 6px 0;
}
</style>
