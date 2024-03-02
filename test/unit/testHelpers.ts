import { createWrapper, Wrapper } from '@vue/test-utils'

/**
 * Emit an event, with a payload on a stub which is the root of the component
 *
 * When the root of a component template is another component,
 * the stub of that component cannot emit directly in tests.
 *
 * `wrapper.find('discard-button-stub').vm.$emit('event')`
 * won't trigger anything.
 *
 * Instead, the root needs to be converted into a wrapper first
 */
export const emitRootStub = async <T extends Vue>(
  wrapper: Wrapper<T>,
  event: string,
  ...payload: any[]
): Promise<void> => {
  const tempWrapper = createWrapper(wrapper.vm.$children[0])
  await tempWrapper.vm.$emit(event, ...payload)
}

/**
 * Emit a native event on a stub which is the root of the component.
 *
 * When the root of a component template is another component,
 * the stub of that component cannot emit directly in tests.
 *
 * `wrapper.find('discard-button-stub').vm.$emit('event')`
 * won't trigger anything.
 *
 * Instead, the root needs to be converted into a wrapper first
 */
export const triggerRootStub = async <T extends Vue>(
  wrapper: Wrapper<T>,
  event: string
): Promise<void> => {
  const tempWrapper = createWrapper(wrapper.vm.$children[0])
  await tempWrapper.trigger(event)
}

export const rootStubProps = (wrapper: Wrapper<any>, prop?: string) => prop
  ? createWrapper(wrapper.vm.$children[0]).props(prop)
  : createWrapper(wrapper.vm.$children[0]).props()

export const rootStubAttributes = (wrapper: Wrapper<any>, prop?: string) => prop
  ? createWrapper(wrapper.vm.$children[0]).attributes(prop)
  : createWrapper(wrapper.vm.$children[0]).attributes()

export const nthEmitted = (wrapper: Wrapper<any>, eventName: string, index: number) =>
  (wrapper.emitted()[eventName] || [])[index]

export const buttonEvents = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
}
