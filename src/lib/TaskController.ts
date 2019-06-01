import Task from './Task'

// Taskオブジェクトを束ねるクラス
export default class TaskController {

  private tasks_: Task[] = []

  get tasks(): Task[] { return this.tasks_; }
  set tasks(value: Task[]) { this.tasks_ = value; }

  /**
   * 見積時間の合計(分)を返す
   * このメソッドを使用すると内部でソートが行われタスクの並びが変わるので注意
   */
  public getEstimateSum(): number {
    let sum: number = 0
    let overedSeparate: boolean = false
    this.sort()
    for (const task of this.tasks_) {
      // 終了タスクの見積を含めると合計が何倍にもなるので除外する
      if (task.endTime == undefined) {
        // 区切りタスクまでの見積時間を集計する。
        // ひとつ上の条件で終了済みの区切りタスクはスキップしているので次の区切りタスクまでの時間を計上していることになる。
        // 区切りタスク実行中は区切りタスク以降の見積時間が表示されなかったのでフラグ制御
        if (task.estimateSeparateEnd === true && overedSeparate === true) {
          break
        }
        sum = sum + task.estimateTime
        overedSeparate = true
      }
    }
    return sum
  }

  /**
   * タスクリストをソートする
   */
  public sort(): void {

    this.backupSortNo()

    // 終了タスクと開始中タスクと開始前タスクをわける
    const doneTasks: Task[] = []
    const doingTask: Task[] = []
    const beforeStartTasks: Task[] = []

    for (const task of this.tasks_) {
      // nextフラグはクリア
      task.isNext = false
      if (task.endTime !== undefined) {
        doneTasks.push(task)
      } else if (task.isDoing === true) {
        doingTask.push(task)
      } else {
        beforeStartTasks.push(task)
      }
    }
    // 終了済みタスクは開始時間でソート
    doneTasks.sort((a: Task, b: Task) => {
      if (a.startTime == undefined) {
        return 1
      } else if (b.startTime == undefined) {
        return -1
      } else {
        return a.startTime.getTime() - b.startTime.getTime()
      }
    })
    // 開始前タスクはセクションとsortNoでソート
    // aよりbが後ろに並ぶべきならば負数を返すように実装すること
    beforeStartTasks.sort((a: Task, b: Task) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime()
      } else {
        return a.sortNo - b.sortNo
      }
    })

    // 開始前タスクの中の一番目のタスクに「次のタスクフラグ」をつける
    if (beforeStartTasks.length > 0) {
      beforeStartTasks[0].isNext = true
    }

    this.tasks_ = doneTasks.concat(doingTask).concat(beforeStartTasks)

    // 番号を振り直す
    for (const [index, item] of this.tasks_.entries()) {
      item.sortNo = index + 1
    }

    // セーブ対象を選定
    for (const task of this.tasks_) {
      if (task.sortNo !== task.oldSortno) {
        task.needSave = true
      }
    }
  }

  private backupSortNo(): void {
    for (const task of this.tasks_) {
      task.backupSortNo()
    }
  }
}
