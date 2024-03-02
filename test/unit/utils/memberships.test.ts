import { buildMembershipPayload } from 'test/unit/factories'

import { getHighestRole } from '@/utils/memberships'

const admin = buildMembershipPayload({ role: 'admin' })
const owner = buildMembershipPayload({ role: 'owner' })
const wfm = buildMembershipPayload({ role: 'workforce_manager' })
const member = buildMembershipPayload({ role: 'member' })
const annotator = buildMembershipPayload({ role: 'annotator' })

describe('getHighestRole', () => {
  it('returns admin if admin membership exists', () => {
    expect(getHighestRole([admin, owner, wfm, member, annotator])).toEqual('admin')
  })

  it('returns owner if owner membership exists', () => {
    expect(getHighestRole([owner, wfm, member, annotator])).toEqual('owner')
  })

  it('returns wfm if wfm membership exists', () => {
    expect(getHighestRole([wfm, member, annotator])).toEqual('workforce_manager')
  })

  it('returns member if member membership exists', () => {
    expect(getHighestRole([member, annotator])).toEqual('member')
  })

  it('returns annotator if annotator membership exists', () => {
    expect(getHighestRole([annotator])).toEqual('annotator')
  })

  it('throws exception when memberships are empty', () => {
    expect.assertions(1)
    try {
      getHighestRole([])
    } catch (error: unknown) {
      expect(error).toBeDefined()
    }
  })
})
