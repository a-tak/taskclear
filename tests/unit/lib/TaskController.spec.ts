import TaskController from '@/lib/TaskController'
import Task from '@/lib/Task'

describe('TaskController.ts', () => {
  const tc = new TaskController()

  const title1 = 'タスクA'
  const task1 = new Task(new Date('2019-01-20 0:00:00'), title1);
  task1.section = new Date('1990-01-01 12:00:00')
  task1.sortNo = 1

  const title2 = 'タスクB'
  const task2 = new Task(new Date('2019-01-20 0:00:00'), title2);
  task1.section = new Date('1990-01-01 9:00:00')
  task1.sortNo = 2

  tc.tasks.push(task1)
  tc.tasks.push(task2)

  it('未開始のタスクはセクション時間が早い者順になる', () => {
    tc.sort()
    expect(tc.tasks[0].title).toMatch(title2);
    expect(tc.tasks[1].title).toMatch(title1);
  })
})
