import { buildDatasetPayload } from 'test/unit/factories'

import { viewedInstructionsOnDataset } from '@/utils/localStorageKeys'

it('instruction viewed key for a dataset', () => {
  const key = viewedInstructionsOnDataset(buildDatasetPayload({ id: 1 }))
  expect(key).toEqual('viewed_instructions_on_dataset:1')
})
