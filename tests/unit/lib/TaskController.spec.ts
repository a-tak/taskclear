import TaskController from '@/lib/TaskController'
import Task from '@/lib/Task'

describe('TaskController.ts', () => {
  const tc = new TaskController()

  const title1 = 'タスクA'
  const task1 = new Task(new Date('2019-01-21 2:00:00'), title1);
  task1.sortNo = 1

  const title2 = 'タスクB'
  const task2 = new Task(new Date('2019-01-20 23:00:00'), title2);
  task2.sortNo = 2

  const title3 = 'タスクC'
  const task3 = new Task(new Date('2019-01-20 12:00:00'), title3);
  task3.sortNo = 4

  const title4 = 'タスクD'
  const task4 = new Task(new Date('2019-01-20 12:00:00'), title4);
  task4.sortNo = 3

  tc.tasks.push(task1)
  tc.tasks.push(task2)
  tc.tasks.push(task3)
  tc.tasks.push(task4)

  tc.sort()

  it('未開始のタスクはセクション時間が早い者順になる', () => {
    expect(tc.tasks[2].title).toMatch(title2);
    expect(tc.tasks[3].title).toMatch(title1);
  })
  it('未開始のタスクはセクション時間が早い者順になる。時間が同じならソート順が早い者順になる。', () => {
    expect(tc.tasks[0].title).toMatch(title4);
    expect(tc.tasks[1].title).toMatch(title3);
  })
})
