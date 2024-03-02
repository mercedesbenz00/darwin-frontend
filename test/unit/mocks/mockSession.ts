import { session } from '@/utils'

const functions: (keyof typeof session)[] = [
  'authenticate',
  'updateToken',
  'logout'
]

const createMocks = () => functions.map(fun => jest.spyOn(session, fun).mockResolvedValue({}))

const resetMocks = () => functions.forEach(fun => (session[fun] as jest.Mock).mockClear())

export const mockSession = () => {
  beforeEach(createMocks)
  afterEach(resetMocks)
}
