import * as token from '@/utils/token'

const functions: (keyof typeof token)[] = [
  'getToken'
]

// @ts-ignore
const createMocks = () => functions.map(fun => jest.spyOn(token, fun).mockResolvedValue({}))

const resetMocks = () => functions.forEach(fun => (token[fun] as jest.Mock).mockClear())

export const mockToken = () => {
  beforeEach(createMocks)
  afterEach(resetMocks)
}
