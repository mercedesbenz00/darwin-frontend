import { Selector, t } from 'testcafe'

export default class AnnotatorTasksModel {
  tasks = Selector('.annotator-task')

  getTask (index: number) {
    return this.tasks.nth(index)
  }

  openTask (index: number) {
    const task = this.getTask(index)
    return t
      .hover(task)
      .click(task.find('.annotator-task__overlay__open__button'))
  }
}
