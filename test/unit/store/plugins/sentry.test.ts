import { buildUserPayload } from 'test/unit/factories'

import { anonymizeUser } from '@/store/plugins/sentry'

describe('anonymizeUser', () => {
  const user = buildUserPayload({
    id: 1, first_name: 'John', last_name: 'Doe', email: 'john@v7labs.com'
  })

  const user2 = buildUserPayload({
    id: 2, first_name: 'James', last_name: 'Smith', email: 'james-smith@v7labs.com'
  })

  it('anonymizes critical user information', () => {
    expect(anonymizeUser(user)).toEqual({
      id: '1',
      username: 'John D**',
      email: 'j***@v7labs.com'
    })

    expect(anonymizeUser(user2)).toEqual({
      id: '2',
      username: 'James S****',
      email: 'j**********@v7labs.com'
    })
  })
})
