import { cloneDeep } from 'lodash'

import { buildTeamPayload, buildDatasetPayload, buildInvitationPayload } from 'test/unit/factories'

import store from '@/store/modules/team'
import { TeamState } from '@/store/modules/team/state'
import {
  InvitationPayload,
  MembershipPayload,
  MembershipScorePayload,
  TeamPayload
} from '@/store/types'

const newState = (): TeamState => cloneDeep(store.state)
const newStateWithTeam = (team: TeamPayload, invitations: InvitationPayload[] = []): TeamState => ({
  ...cloneDeep(store.state),
  currentTeam: team,
  invitations
})

const v7 = buildTeamPayload({ id: 1, slug: 'v7', name: 'V7' })
const v8 = buildTeamPayload({ id: 2, slug: 'v8', name: 'V8' })
const v9 = buildTeamPayload({ id: 3, slug: 'v9', name: 'V9' })

const sfh = buildDatasetPayload({ id: 5, name: 'SFH', team_id: v7.id })

const sam: InvitationPayload = buildInvitationPayload({
  id: 1,
  team_id: 1,
  email: 'sam@v7labs.com',
  confirmed: false,
  role: 'annotator'
})
const jim: InvitationPayload = buildInvitationPayload({
  id: 2,
  team_id: 1,
  email: 'jim@v7labs.com',
  confirmed: false,
  role: 'annotator'
})

const andrea: MembershipPayload = {
  id: 1,
  email: 'andrea@v7labs.com',
  role: 'owner',
  user_id: 1,
  team_id: 1,
  first_name: 'Andrea',
  last_name: 'Azzini',
  image: { id: 4, thumbnail_url: '', url: '' }
}

const simon: MembershipPayload = {
  id: 2,
  email: 'simon@v7labs.com',
  role: 'admin',
  user_id: 2,
  team_id: 1,
  first_name: 'Simon',
  last_name: 'Edwardson',
  image: { id: 5, thumbnail_url: '', url: '' }
}

const nikola: MembershipPayload = {
  id: 3,
  email: 'nikola@v7labs.com',
  role: 'member',
  user_id: 3,
  team_id: 1,
  first_name: 'Nikola',
  last_name: 'Begedin',
  image: { id: 6, thumbnail_url: '', url: '' }
}

const {
  SET_CURRENT_TEAM,
  PUSH_TEAM,
  SET_TEAMS,
  SET_TEAM_AVATAR_URL,
  REMOVE_TEAM,
  UNSET_CURRENT_TEAM,
  ADD_INVITATION,
  UPDATE_INVITATION,
  DELETE_INVITATION,
  SET_MEMBERSHIPS,
  PUSH_MEMBERSHIP_SCORES,
  UPDATE_MEMBERSHIP,
  DELETE_MEMBERSHIP,
  SET_MEMBER_AVATAR_URL
} = store.mutations

describe('SET_CURRENT_TEAM', () => {
  it('sets current team', () => {
    const state = newState()
    expect(state.currentTeam).toEqual(null)

    SET_CURRENT_TEAM(state, v7)
    expect(state.currentTeam).toEqual(v7)
    expect(state.invitations).toEqual([])
  })

  it('unsets team', () => {
    const state = newState()

    SET_CURRENT_TEAM(state, v7)
    expect(state.currentTeam).not.toBeNull()
    SET_CURRENT_TEAM(state, null)
    expect(state.currentTeam).toBeNull()
  })
})

describe('PUSH_TEAM', () => {
  it('pushes new team at the end of existing teams', () => {
    const state = newState()
    expect(state.teams).toEqual([])

    PUSH_TEAM(state, { id: 1 })
    expect(state.teams).toEqual([{ id: 1 }])

    PUSH_TEAM(state, { id: 2 })
    expect(state.teams).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('replaces existing team if matched by id', () => {
    const state = newState()
    expect(state.teams).toEqual([])

    PUSH_TEAM(state, { id: 1 })
    expect(state.teams).toEqual([{ id: 1 }])

    PUSH_TEAM(state, { id: 1 })
    expect(state.teams).toEqual([{ id: 1 }])
  })
})

describe('SET_TEAMS', () => {
  it('replaces existing teams', () => {
    const state = newState()
    expect(state.teams).toEqual([])

    SET_TEAMS(state, [{ id: 1 }])
    expect(state.teams).toEqual([{ id: 1 }])

    SET_TEAMS(state, [{ id: 2 }, { id: 3 }])
    expect(state.teams).toEqual([{ id: 2 }, { id: 3 }])
  })
})

describe('SET_TEAM_AVATAR_URL', () => {
  it('sets image for currentTeam', () => {
    const state = newStateWithTeam(v7)

    SET_TEAM_AVATAR_URL(state, 'bar')
    expect((state.currentTeam!.image as { url?: string }).url).toEqual('bar')

    SET_TEAM_AVATAR_URL(state, 'baz')
    expect((state.currentTeam!.image as { url?: string }).url).toEqual('baz')
  })
})

describe('REMOVE_TEAM', () => {
  it('removes team from teams, by id', () => {
    const state = { ...newState(), teams: [v7, v8, v9] }

    REMOVE_TEAM(state, v7)
    expect(state.teams).toEqual([v8, v9])
  })

  it('does nothing if team not matched', () => {
    const state = { ...newState(), teams: [v7, v8] }

    REMOVE_TEAM(state, v9)
    expect(state.teams).toEqual([v7, v8])
  })
})

describe('UNSET_CURRENT_TEAM', () => {
  it('sets current team to null', () => {
    const state = newStateWithTeam(v7)

    expect(state.currentTeam).not.toBeNull()

    UNSET_CURRENT_TEAM(state, state.currentTeam)
    expect(state.currentTeam).toBeNull()
  })
})

describe('ADD_INVITATION', () => {
  it('adds invitation to invitations', () => {
    const state = newStateWithTeam(v7)

    ADD_INVITATION(state, sam)
    expect(state.invitations).toEqual([sam])

    ADD_INVITATION(state, jim)
    expect(state.invitations).toEqual([sam, jim])
  })
})

describe('UPDATE_INVITATION', () => {
  it('replaces invitation matched by id', () => {
    const state = newStateWithTeam(v7, [sam, jim])

    UPDATE_INVITATION(state, { ...sam, email: 'newsam@email.com' })
    expect(state.invitations).toEqual([
      { ...sam, email: 'newsam@email.com' },
      jim
    ])
  })

  it('does nothing if unmatched by id', () => {
    const state = newStateWithTeam(v7, [sam])

    UPDATE_INVITATION(state, jim)
    expect(state.invitations).toEqual([sam])
  })
})

describe('DELETE_INVITATION', () => {
  it('removes invitation matched by id', () => {
    const state = newStateWithTeam(v7, [sam, jim])

    DELETE_INVITATION(state, sam.id)
    expect(state.invitations).toEqual([jim])
  })

  it('does nothing if unmatched by id', () => {
    const state = newStateWithTeam(v7, [sam])

    DELETE_INVITATION(state, jim.id)
    expect(state.invitations).toEqual([sam])
  })
})

describe('SET_MEMBERSHIPS', () => {
  it('replaces memberships', () => {
    const state = newState()
    expect(state.memberships).toEqual([])

    SET_MEMBERSHIPS(state, [andrea])
    expect(state.memberships).toEqual([andrea])

    SET_MEMBERSHIPS(state, [simon, nikola])
    expect(state.memberships).toEqual([simon, nikola])
  })
})

describe('PUSH_MEMBERSHIP_SCORES', () => {
  it('sets membership scores by id key', () => {
    const state = newState()
    expect(state.scoresByDataset).toEqual({})
    expect(state.scoresByTeam).toEqual({})

    const andreaScore: MembershipScorePayload = {
      id: andrea.id,
      dataset: {
        score: 5.0,
        merged_instances: 11,
        rejected_instances: 1
      },
      team: {
        score: 10.0,
        merged_instances: 20,
        rejected_instances: 1
      }
    }

    const simonScore: MembershipScorePayload = {
      id: simon.id,
      dataset: {
        score: 6.0,
        merged_instances: 12,
        rejected_instances: 1
      },
      team: {
        score: 11.0,
        merged_instances: 22,
        rejected_instances: 1
      }
    }

    PUSH_MEMBERSHIP_SCORES(state, {
      data: [andreaScore, simonScore], teamId: v7.id, datasetId: sfh.id
    })

    expect(state.scoresByDataset).toEqual({
      [sfh.id]: {
        [andrea.id]: { score: 5.0, mergedInstances: 11, rejectedInstances: 1 },
        [simon.id]: { score: 6.0, mergedInstances: 12, rejectedInstances: 1 }
      }
    })

    expect(state.scoresByTeam).toEqual({
      [v7.id]: {
        [andrea.id]: { score: 10.0, mergedInstances: 20, rejectedInstances: 1 },
        [simon.id]: { score: 11.0, mergedInstances: 22, rejectedInstances: 1 }
      }
    })

    const newSimonScore: MembershipScorePayload = {
      id: simon.id,
      dataset: {
        score: 7.0,
        merged_instances: 12,
        rejected_instances: 1
      },
      team: {
        score: 55.0,
        merged_instances: 22,
        rejected_instances: 1
      }
    }

    PUSH_MEMBERSHIP_SCORES(state, {
      data: [andreaScore, newSimonScore], teamId: v7.id, datasetId: sfh.id
    })
    expect(state.scoresByDataset).toEqual({
      [sfh.id]: {
        [andrea.id]: { score: 5.0, mergedInstances: 11, rejectedInstances: 1 },
        [simon.id]: { score: 7.0, mergedInstances: 12, rejectedInstances: 1 }
      }
    })

    expect(state.scoresByTeam).toEqual({
      [v7.id]: {
        [andrea.id]: { score: 10.0, mergedInstances: 20, rejectedInstances: 1 },
        [simon.id]: { score: 55.0, mergedInstances: 22, rejectedInstances: 1 }
      }
    })
  })
})

describe('UPDATE_MEMBERSHIP', () => {
  it('replaces membership matched by id', () => {
    const state = { ...newState(), memberships: [andrea, simon] }

    UPDATE_MEMBERSHIP(state, { ...andrea, email: 'new@v7labs.com' })
    expect(state.memberships).toEqual([{ ...andrea, email: 'new@v7labs.com' }, simon])
  })

  it('does nothing if unmatched by id', () => {
    const state = { ...newState(), memberships: [andrea, simon] }

    UPDATE_MEMBERSHIP(state, nikola)
    expect(state.memberships).toEqual([andrea, simon])
  })
})

describe('DELETE_MEMBERSHIP', () => {
  it('removes membership matched by id', () => {
    const state = { ...newState(), memberships: [andrea, simon] }

    DELETE_MEMBERSHIP(state, andrea.id)
    expect(state.memberships).toEqual([simon])
  })

  it('does nothing if unmatched by id', () => {
    const state = { ...newState(), memberships: [andrea, simon] }

    DELETE_MEMBERSHIP(state, nikola.id)
    expect(state.memberships).toEqual([andrea, simon])
  })
})

describe('SET_MEMBER_AVATAR_URL', () => {
  it('replaces image of membership matched by user_id', () => {
    const state = { ...newState(), memberships: [andrea, simon] }

    SET_MEMBER_AVATAR_URL(state, { ...andrea, image: { url: 'foo' } })
    expect(state.memberships).toEqual([
      { ...andrea, image: { ...andrea.image, url: 'foo' } },
      simon
    ])
  })

  it('does nothing if unmatched by id', () => {
    const state = newState()

    SET_MEMBER_AVATAR_URL(state, { ...andrea, image: { url: 'foo' } })
    expect(state.memberships).toEqual([])
  })
})
