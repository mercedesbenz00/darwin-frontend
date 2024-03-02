import directive, { BoundElement } from '@/directives/input-auto-blur'

function createHookArguments (el = document.createElement('input'), binding = {}) {
  return {
    el: el as BoundElement,
    binding: { name: 'input', modifiers: {}, value: true, ...binding },
    vNode: { isRootInsert: false, isComment: false },
    oldVNode: { isRootInsert: false, isComment: false }
  }
}

const HANDLERS_PROPERTY = '__inputAutoBlurHandler__'

describe('v-input-auto-blur -> directive', () => {
  it('it has bind, update and unbind methods available', () => {
    expect(typeof directive.bind).toBe('function')
    expect(typeof directive.update).toBe('function')
    expect(typeof directive.unbind).toBe('function')
  })

  describe('bind', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener').mockReturnValue(undefined)
    })

    it('throws an error if the binding value is not a function or an object', () => {
      expect(() => directive.bind(
        document.createElement('input'),
        { name: 'input', modifiers: {}, value: 100 },
        { isRootInsert: false, isComment: false },
        { isRootInsert: false, isComment: false }
      )
      ).toThrowError('vue-input-auto-blur: Binding value must be a boolean')
    })

    it('adds an event listener to the element and stores the handlers on the element', () => {
      const { el, binding, vNode, oldVNode } = createHookArguments()

      jest.spyOn(el, 'addEventListener').mockReturnValue(undefined)
      directive.bind(el, binding, vNode, oldVNode)
      expect(el[HANDLERS_PROPERTY]).toBeDefined()
      expect(typeof el[HANDLERS_PROPERTY]!.mouseHandler).toEqual('function')
      expect(typeof el[HANDLERS_PROPERTY]!.keydownHandler).toEqual('function')

      expect(document.addEventListener).toBeCalled()
      expect(el.addEventListener).toBeCalled()
    })
  })

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener').mockReturnValue(undefined)
      jest.spyOn(document, 'removeEventListener').mockReturnValue(undefined)
    })

    it('throws an error if the binding value is not a function or an object', () => {
      expect(() => directive.update(
        document.createElement('input'),
        { name: 'input', modifiers: {}, value: 100 },
        { isRootInsert: false, isComment: false },
        { isRootInsert: false, isComment: false }
      )
      ).toThrowError('vue-input-auto-blur: Binding value must be a boolean')
    })

    it('adds an event listener to the element and stores the handlers on the element when value is true', () => {
      const { el, binding, vNode, oldVNode } = createHookArguments()

      jest.spyOn(el, 'addEventListener').mockReturnValue(undefined)
      directive.update(el, binding, vNode, oldVNode)

      expect(el[HANDLERS_PROPERTY]).toBeDefined()
      expect(typeof el[HANDLERS_PROPERTY]!.mouseHandler).toEqual('function')
      expect(typeof el[HANDLERS_PROPERTY]!.keydownHandler).toEqual('function')
      expect(document.addEventListener).toBeCalled()
      expect(el.addEventListener).toBeCalled()
    })

    it('removes an event listener to the element and stores the handlers on the element when value is false', () => {
      const { el, binding, vNode, oldVNode } = createHookArguments()

      jest.spyOn(el, 'addEventListener').mockReturnValue(undefined)
      jest.spyOn(el, 'removeEventListener').mockReturnValue(undefined)

      directive.bind(el, binding, vNode, oldVNode)
      binding.value = false
      directive.update(el, binding, vNode, oldVNode)

      expect(document.removeEventListener).toBeCalled()
      expect(el.removeEventListener).toBeCalled()
      expect(el[HANDLERS_PROPERTY]).toBeUndefined()
    })
  })

  describe('unbind', () => {
    beforeEach(() => {
      jest.spyOn(document, 'addEventListener').mockReturnValue(undefined)
      jest.spyOn(document, 'removeEventListener').mockReturnValue(undefined)
    })

    it('removes event listeners', () => {
      const { el, binding, vNode, oldVNode } = createHookArguments()

      jest.spyOn(el, 'addEventListener').mockReturnValue(undefined)
      jest.spyOn(el, 'removeEventListener').mockReturnValue(undefined)

      directive.bind(el, binding, vNode, oldVNode)
      directive.unbind(el, binding, vNode, oldVNode)

      expect(document.removeEventListener).toBeCalled()
      expect(el.removeEventListener).toBeCalled()
      expect(el[HANDLERS_PROPERTY]).toBeUndefined()
    })
  })
})
