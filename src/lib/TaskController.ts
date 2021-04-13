import Task from "./Task"

// Taskオブジェクトを束ねるクラス
export default class TaskController {

  private tasks_: Task[] = []

  get tasks(): Task[] { return this.tasks_ }
  set tasks(value: Task[]) { this.tasks_ = value }

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
    // なければ実行中のタスクにフラグをつける
    } else if (doingTask.length > 0) {
      doingTask[0].isNext = true
    // それもなければ完了したタスクの一番最後のタスクにフラグをつける
    } else if (doneTasks.length > 0) {
      doneTasks[doneTasks.length - 1].isNext = true
    }

    this.tasks_ = doneTasks.concat(doingTask).concat(beforeStartTasks)

    // 番号を振り直す
    for (const [index, item] of this.tasks_.entries()) {
      item.sortNo = index + 1
    }
  }

  /**
   * 見積区切りタスクに到達するには何時までかかるか応答する
   */
  public getEstimateTime(): Date {
    const sum: number = this.getEstimateSum()
    let endTime: Date = new Date()
    let estimateStartTask: Task | undefined = this.getEstimateStartTask()
    if (estimateStartTask == undefined) {
      if (this.tasks_.length > 0) {
        // タスクが事前にソートされている前提での処理(今はgetEstimeteSumでソートされている)
        estimateStartTask = this.tasks_[0]
      } else {
        endTime.setHours(0)
        endTime.setMinutes(0)
        return endTime
      }
    }

    const taskDate: Date = new Date(estimateStartTask.date)

    if (taskDate < new Date()) {
      // 見積開始タスクの時間後であれば今の時間が起点
      endTime.setMinutes(endTime.getMinutes() + sum)
      return endTime
    } else {
      endTime = new Date(taskDate.setMinutes(taskDate.getMinutes() + sum))
      return endTime
    }
  }

  /**
   * 見積時間の合計(分)を返す
   * このメソッドを使用すると内部でソートが行われタスクの並びが変わるので注意
   * 見積開始フラグがついているタスクの見積時間は合計に含める
   */
  private getEstimateSum(): number {
    let sum: number = 0
    let overedSeparate: boolean = false

    this.sort()

    // 見積開始フラグが一つも無い場合はその日の最初のタスクから判定していく
    // 見積開始フラグがあるか調べる
    let overedEstimateStart: boolean = true
    if (this.isIncludeEstimateStartTask() === true) {
      overedEstimateStart = false
    }

    for (const task of this.tasks_) {
      if (task.estimateSeparateStart === true) {
        overedEstimateStart = true
      }
      // 終了タスクの見積を含めると合計が何倍にもなるので除外する
      if (task.endTime == undefined && overedEstimateStart === true) {
        // 区切りタスクまでの見積時間を集計する。
        // ひとつ上の条件で終了済みの区切りタスクはスキップしているので次の区切りタスクまでの時間を計上していることになる。
        // 区切りタスク実行中は区切りタスク以降の見積時間が表示されなかったのでフラグ制御
        if (task.estimateSeparateEnd === true && overedSeparate === true) {
          break
        }

        // 実行中のタスクは見積から実績時間を引いた時間を見積に足す
        if (task.isDoing === true) {
          let remain: number = task.estimateTime - task.actualTime
          if (remain < 0) {
            remain = 0
          }
          sum = sum + remain
        } else {
          sum = sum + task.estimateTime
        }
        overedSeparate = true
      }
    }
    return sum
  }

  /**
   * 見積開始タスクが存在するかを返す
   * 毎回ループして返しているのでパフォーマンスは良くない
   */
  private isIncludeEstimateStartTask(): boolean {
    if (this.getEstimateStartTask != undefined) {
      return false
    } else {
      return true
    }
  }

  /**
   * 見積開始タスクを返す
   * なければundefinedを返す
   */
  private getEstimateStartTask(): Task | undefined {
    for (const task of this.tasks_) {
      if (task.estimateSeparateStart === true) {
        return task
      }
    }
    return undefined
  }

  private backupSortNo(): void {
    for (const task of this.tasks_) {
      task.backupSortNo()
    }
  }
}
