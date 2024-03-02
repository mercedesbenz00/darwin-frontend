import { CallbackHandleCollection, CallbackStatus } from './callbackHandler'

test('Will call all callbacks', () => {
  const callbacks = new CallbackHandleCollection<[number, string]>()
  const callback = jest.fn()
  // let fun = (x: number, y: string) => {
  //   count +=1;
  //   expect(x == 10)
  //   expect(y == "test")
  // };
  const handle1 = callbacks.add(callback)
  callbacks.add(callback)
  callbacks.call(10, 'test')
  expect(callback).toBeCalledTimes(2)
  expect(callback).lastCalledWith(10, 'test')
  // release the first handle
  handle1.release()
  callbacks.call(42, 'test!')
  expect(callback).toBeCalledTimes(3)
  expect(callback).lastCalledWith(42, 'test!')
})

test('Respects Stop', () => {
  const callbacks = new CallbackHandleCollection<[number, string]>()
  const callback1 = jest.fn()
  const callback2 = (): CallbackStatus => {
    return CallbackStatus.Stop
  }
  const callback3 = jest.fn()

  callbacks.add(callback1)
  callbacks.add(callback2)
  callbacks.add(callback3)

  callbacks.call(10, 'test')
  expect(callback1).toBeCalledTimes(1)
  expect(callback3).toBeCalledTimes(0)
})
