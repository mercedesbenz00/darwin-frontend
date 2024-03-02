<template>
  <div class="workforce-managers">
    <h3 class="workforce-managers__title">
      Add Workforce Managers
    </h3>
    <p
      class="workforce-managers__description"
    >
      Managers have the same rights as Users, but only within this dataset.
      They can invite workers, assign images to them, look through the dataset,
      and generate annotation exports.
      They cannot see other datasets in your Team unless you add them to one.
    </p>
    <vue-tags-input
      v-model="filter"
      :autocomplete-items="autoCompleteItems"
      :autocomplete-min-length="0"
      class="workforce-managers__input"
      :class="{'workforce-managers__input--empty': tags.length === 0}"
      :tags="tags"
      add-only-from-autocomplete
      avoid-adding-duplicates
      placeholder="Add managers"
      @tags-changed="onTagsChange"
    >
      <template #autocomplete-header>
        <div class="workforce-managers__autocomplete-header">
          Managers
        </div>
      </template>
      <div
        slot="autocomplete-item"
        slot-scope="props"
        class="member-autocomplete"
        @click="props.performAdd(props.item)"
      >
        <responsive-team-member-avatar
          v-if="props.item.userInfo"
          class="member-autocomplete__icon"
          :member="props.item.userInfo"
        />
        <responsive-avatar
          v-else
          :id="props.item.id"
          class="member-autocomplete__icon"
          :name="props.item.text"
        />
        <span class="member-autocomplete__text">{{ props.item.text }}</span>
      </div>
      <div
        slot="tag-left"
        slot-scope="props"
      >
        <responsive-team-member-avatar
          v-if="props.tag.userInfo"
          class="member__icon"
          :member="props.tag.userInfo"
        />
        <responsive-avatar
          v-else
          :id="props.tag.id"
          class="member__icon"
          :name="props.tag.text"
        />
      </div>
    </vue-tags-input>
  </div>
</template>

<script lang="ts">
import VueTagsInput from '@johmun/vue-tags-input'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ResponsiveAvatar from '@/components/Common/Avatar/V1/ResponsiveAvatar.vue'
import ResponsiveTeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import {
  DatasetPayload,
  InvitationPayload,
  MembershipPayload,
  WorkforceManagerPayload
} from '@/store/types'
import { getFullName } from '@/utils'

type ManagerTag = {
  id: string
  userInfo?: MembershipPayload | WorkforceManagerPayload['user']
  managerId?: WorkforceManagerPayload['id']
  userId?: MembershipPayload['user_id']
  invitationId?: InvitationPayload['id']
  text: string
}

const managerToTag = (manager: WorkforceManagerPayload): ManagerTag => ({
  id: manager.id.toString(),
  managerId: manager.id,
  userId: manager.user ? manager.user.id : undefined,
  invitationId: manager.invitation ? manager.invitation.id : undefined,
  text: manager.user
    ? getFullName(manager.user)
    : manager.invitation ? manager.invitation.email : '',
  userInfo: manager.user || undefined
})

@Component({
  name: 'workforce-managers',
  components: {
    ResponsiveAvatar,
    ResponsiveTeamMemberAvatar,
    VueTagsInput
  }
})
export default class WorkforceManagers extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  mounted () {
    this.loadAndSetManagers()
    this.$store.dispatch('team/getInvitations')
  }

  @State(state => state.dataset.workforceManagers)
  allManagers!: WorkforceManagerPayload[]

  get workforceManagers (): WorkforceManagerPayload[] {
    const { allManagers, dataset } = this
    return allManagers.filter(m => m.dataset_id === dataset.id)
  }

  tags: ManagerTag[] = []

  filter: string = ''

  @Watch('dataset')
  async loadAndSetManagers () {
    await this.$store.dispatch('dataset/loadWorkforceManagers', this.dataset)
    this.tags = this.workforceManagers.map(managerToTag)
  }

  @State(state => state.team.memberships)
  allMemberships!: MembershipPayload[]

  @State(state => state.team.invitations)
  allInvitations!: InvitationPayload[]

  get autoCompleteItems (): ManagerTag[] {
    const { allMemberships, allInvitations, dataset } = this
    const fromMemberships: ManagerTag[] = allMemberships
      .filter(m => m.team_id === dataset.team_id && m.role === 'workforce_manager')
      .map(m => ({
        id: `membership-${m.id}`,
        text: getFullName(m),
        userId: m.user_id,
        userInfo: m
      }))

    const fromInvites: ManagerTag[] = allInvitations
      .filter(i => i.team_id === dataset.team_id && i.role === 'workforce_manager')
      .map(i => ({
        id: `invitation-${i.id}`,
        invitationId: i.id,
        text: i.email
      }))

    return fromMemberships.concat(fromInvites)
  }

  convertAndAddTag (item: ManagerTag) {
    const { text, id, invitationId, userId, userInfo } = item

    const newTag: ManagerTag = {
      id,
      invitationId,
      text,
      userId,
      userInfo
    }
    this.tags.push(newTag)
  }

  onTagsChange (data: ManagerTag[]) {
    const payload = data.map(m => {
      const { invitationId, managerId, userId } = m
      return {
        ...(invitationId && { invitationId }),
        ...(managerId && { managerId }),
        ...(userId && { userId })
      }
    })

    this.$emit('change', payload)
    this.tags = data
    this.filter = ''
  }
}
</script>

<style lang="scss" scoped>
.workforce-managers {
  display: grid;
  grid-auto-flow: row;
  row-gap: 10px;
}

.workforce-managers__title {
  @include typography(lg-1, headlines, bold);
}

.workforce-managers :deep(.ti-tag) {
  background-color: $colorAliceShade;
  color: $color90Black;
  border-radius: 3px;
  cursor: default;
}

.workforce-managers :deep(.ti-content) {
  height: 26px;
}

.workforce-managers :deep(.ti-content),
.member-autocomplete {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 4px;
  align-items: center;
}

.workforce-managers :deep(.ti-tag-left),
.member-autocomplete__icon {
  height: 21px;
  width: 21px;

}

.workforce-managers__input {
  max-width: 100%;
  background: $colorLineGrey;
  border-radius: 3px;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  transition: background-color .2s ease;
}

.workforce-managers__input--empty:not(.ti-focus) {
  background: $colorAliceShade;
}

.workforce-managers__input :deep(.ti-input) {
  border: transparent;
}

.workforce-managers__input :deep(.ti-input) input {
  background: transparent;
}

.workforce-managers :deep(.ti-autocomplete) {
  @include dropdownBelow;
  border: transparent;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  width: auto;
}

.workforce-managers :deep(.ti-autocomplete) {
  padding: 10px;
}

.workforce-managers :deep(.ti-autocomplete) ul {
  display: grid;
  grid-auto-flow: row;
  row-gap: 3px;
  justify-items: start;
  padding-left: 5px;

  max-height: 300px;
  overflow: auto;
}

.workforce-managers :deep(.ti-item) {
  background: none;
}

.workforce-managers .member-autocomplete {
  background-color: transparent;
  color: $color90Black;
  cursor: default;
  border-radius: 3px;
  transition: background-color .2s ease;
  padding: 6px 10px;

  &:hover,
  &:focus,
  &:active {
    background-color: $colorAliceShade;
  }
}

.workforce-managers__autocomplete-header {
  color: $colorAliceNight;
  @include typography(sm, headlines, bold);
  margin-bottom: 10px;
}
</style>
