import { loadImageData } from '@/engine/utils'

it('works', () => {
  const imageData = loadImageData(new Image(100, 100))
  expect(imageData).toBeDefined()
})
