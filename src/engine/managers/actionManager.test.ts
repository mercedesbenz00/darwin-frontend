import { Action, ActionManager } from '@/engine/managers'

function actionFactory (): Action {
  const doFn = jest.fn().mockResolvedValue(true)
  const undoFn = jest.fn().mockResolvedValue(true)
  return { do: doFn, undo: undoFn }
}

test('canUndo/canRedo are correctly set', async () => {
  const action = actionFactory()
  const actionManager = new ActionManager()

  expect(actionManager.canRedo).toBeFalsy()
  expect(actionManager.canUndo).toBeFalsy()

  await actionManager.do(action)
  expect(actionManager.canRedo).toBeFalsy()
  expect(actionManager.canUndo).toBeTruthy()

  await actionManager.undo()
  expect(actionManager.canRedo).toBeTruthy()
  expect(actionManager.canUndo).toBeFalsy()

  await actionManager.redo()
  expect(actionManager.canRedo).toBeFalsy()
  expect(actionManager.canUndo).toBeTruthy()
})

test('Added actions get executed', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()
  const actionManager = new ActionManager()

  await actionManager.do(action1)

  expect(action1.do).toBeCalledTimes(1)
  expect(action1.undo).toBeCalledTimes(0)

  await actionManager.do(action2)
  expect(action1.do).toBeCalledTimes(1)
  expect(action1.undo).toBeCalledTimes(0)
  expect(action2.do).toBeCalledTimes(1)
  expect(action2.undo).toBeCalledTimes(0)
})

test('Added actions get undone in order', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()
  const actionManager = new ActionManager()

  await actionManager.do(action1)
  await actionManager.do(action2)
  await actionManager.undo()
  expect(action1.undo).toBeCalledTimes(0)
  expect(action2.undo).toBeCalledTimes(1)

  await actionManager.undo()
  expect(action1.undo).toBeCalledTimes(1)
  expect(action2.undo).toBeCalledTimes(1)

  await actionManager.undo()
  expect(action1.undo).toBeCalledTimes(1)
  expect(action2.undo).toBeCalledTimes(1)
})

test('Redone actions get performed in order', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()
  const actionManager = new ActionManager()

  await actionManager.do(action1)
  await actionManager.do(action2)
  await actionManager.undo()
  await actionManager.undo()
  await actionManager.redo()
  expect(action1.do).toBeCalledTimes(2)
  expect(action2.do).toBeCalledTimes(1)
  await actionManager.redo()
  expect(action1.do).toBeCalledTimes(2)
  expect(action2.do).toBeCalledTimes(2)
})

test('Undo and new action leads to branching', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()
  const action3 = actionFactory()

  const actionManager = new ActionManager()

  await actionManager.do(action1)
  await actionManager.do(action2)
  await actionManager.undo()
  await actionManager.do(action3)

  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  expect(action3.do).toBeCalledTimes(1)

  await actionManager.redo()
  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  expect(action3.do).toBeCalledTimes(1)
  expect(action1.undo).toBeCalledTimes(0)
  expect(action2.undo).toBeCalledTimes(1)
  expect(action3.undo).toBeCalledTimes(0)

  await actionManager.undo()
  await actionManager.redo()
  expect(action3.do).toBeCalledTimes(2)
})

test('Undo empty stack', async () => {
  const actionManager = new ActionManager()
  await actionManager.undo()
  await actionManager.redo()
})

test('Undo and redo works deeply', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()

  const actionManager = new ActionManager()

  await actionManager.do(action1)
  await actionManager.do(action2)
  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  await actionManager.undo()
  await actionManager.undo()
  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  expect(action1.undo).toBeCalledTimes(1)
  expect(action2.undo).toBeCalledTimes(1)
  await actionManager.redo()
  await actionManager.redo()
  expect(action1.do).toBeCalledTimes(2)
  expect(action2.do).toBeCalledTimes(2)
  await actionManager.undo()
  await actionManager.undo()
  expect(action1.undo).toBeCalledTimes(2)
  expect(action2.undo).toBeCalledTimes(2)
})

test('Actions in groups are undo/redo-able', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()

  const actionManager = new ActionManager()
  const group = actionManager.createGroup()

  await group.do(action1)
  await group.do(action2)
  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  await actionManager.undo()
  await actionManager.undo()
  expect(action1.do).toBeCalledTimes(1)
  expect(action2.do).toBeCalledTimes(1)
  expect(action1.undo).toBeCalledTimes(1)
  expect(action2.undo).toBeCalledTimes(1)
  await actionManager.redo()
  await actionManager.redo()
  expect(action1.do).toBeCalledTimes(2)
  expect(action2.do).toBeCalledTimes(2)
  await actionManager.undo()
  await actionManager.undo()
  expect(action1.undo).toBeCalledTimes(2)
  expect(action2.undo).toBeCalledTimes(2)
})

test('Actions in groups can be deleted', async () => {
  const action1 = actionFactory()
  const action2 = actionFactory()

  const actionManager = new ActionManager()
  const group1 = actionManager.createGroup()
  const group2 = actionManager.createGroup()

  await group1.do(action1)
  await group2.do(action2)
  await actionManager.undo()

  expect(actionManager.canRedo).toBeTruthy()
  expect(actionManager.canUndo).toBeTruthy()

  group2.remove()
  expect(actionManager.canRedo).toBeFalsy()
  expect(actionManager.canUndo).toBeTruthy()
  group1.remove()

  expect(actionManager.canRedo).toBeFalsy()
  expect(actionManager.canUndo).toBeFalsy()
})

it('emits an event on "do"', async () => {
  const action = actionFactory()
  const actionManager = new ActionManager()

  const callSpy = jest.fn()

  actionManager.on('action', callSpy)

  await actionManager.do(action)

  expect(callSpy).toHaveBeenCalledTimes(1)
})

it('emits an event on "undo"', async () => {
  const actionManager = new ActionManager()

  const callSpy = jest.fn()

  actionManager.on('action', callSpy)

  await actionManager.undo()

  expect(callSpy).toHaveBeenCalledTimes(1)
})

it('emits an event on "redo"', async () => {
  const actionManager = new ActionManager()

  const callSpy = jest.fn()

  actionManager.on('action', callSpy)

  await actionManager.redo()

  expect(callSpy).toHaveBeenCalledTimes(1)
})
