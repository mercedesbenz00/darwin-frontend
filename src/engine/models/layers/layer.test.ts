import { Layer } from './layer'

let layerInstance: Layer

beforeEach(() => {
  layerInstance = new Layer()
})

it('adds and retrieves render items', () => {
  const obj = {
    id: 'object',
    render: (): void => {}
  }

  layerInstance.add(obj)

  expect(layerInstance.getItem('object')).toEqual(obj)
})

it('should remove an object from the render pool', () => {
  layerInstance.add({
    id: 'object',
    render: (): void => {}
  })

  layerInstance.remove('object')

  expect(layerInstance.getItem('object')).toBeUndefined()
})

it('should check existence of the object', () => {
  layerInstance.add({
    id: 'check_object',
    render: (): void => {}
  })

  expect(layerInstance.has('check_object')).toBeTruthy()
  expect(layerInstance.has('no_object')).toBeFalsy()
})

it('should render all items from the render pool', () => {
  const renderSpy1 = jest.fn()
  const renderSpy2 = jest.fn()

  layerInstance.add({
    id: 'render_object_1',
    render: renderSpy1
  })
  layerInstance.add({
    id: 'render_object_2',
    render: renderSpy2
  })

  layerInstance.render()

  expect(renderSpy1).toHaveBeenCalledTimes(1)
  expect(renderSpy2).toHaveBeenCalledTimes(1)
})

it('should avoid unchanged layer render', () => {
  const renderSpy = jest.fn()

  layerInstance.add({
    id: 'render_object',
    render: renderSpy
  })

  layerInstance.render()

  renderSpy.mockReset()

  layerInstance.render()

  expect(renderSpy).not.toHaveBeenCalled()
})

it('should render changed layers pool', () => {
  const renderSpy = jest.fn()

  layerInstance.add({
    id: 'render_object',
    render: renderSpy
  })

  layerInstance.render()

  renderSpy.mockReset()

  layerInstance.changed()

  layerInstance.render()

  expect(renderSpy).toHaveBeenCalled()
})

it('should clear layer', () => {
  const renderSpy = jest.fn()

  layerInstance.add({
    id: 'render_object',
    render: renderSpy
  })

  layerInstance.clear()

  expect(layerInstance.has('render_object')).toBeFalsy()
  expect(renderSpy).not.toHaveBeenCalled()
})

it('should mark layer as changed on `clear` call', () => {
  const renderSpy = jest.fn()

  layerInstance.add({
    id: 'render_object',
    render: renderSpy
  })
  layerInstance.render()
  layerInstance.clear()

  // @ts-ignore
  expect(layerInstance._hasChanges).toBeTruthy()
})
