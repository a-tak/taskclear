import { firestore } from 'firebase';
import Task from './Task';
import ITask from '@/lib/ITask';

// Taskオブジェクトを束ねるクラス
export default class TaskController {

    private tasks_: Task[] = [];

    get tasks(): Task[] { return this.tasks_; }
    set tasks(value: Task[]) { this.tasks_ = value; }

    /**
     * 見積時間の合計(分)を返す
     */
    public getEstimateSum(): number {
        let sum: number = 0;
        for (const task of this.tasks_) {
            // 終了タスクの見積を含めると合計が何倍にもなるので除外する
            if (task.endTime == null) {
                sum = sum + task.estimateTime;
            }
        }
        return sum;
    }

    /**
     * タスクリストをソートする
     */
    public sort(): void {

        this.backupSortNo();

        // 終了タスクと開始中タスクと開始前タスクをわける
        const doneTasks: Task[] = [];
        const doingTask: Task[] = [];
        const beforeStartTasks: Task[] = [];

        for (const task of this.tasks_) {
            // nextフラグはクリア
            task.isNext = false;
            if (task.endTime !== null) {
                doneTasks.push(task);
            } else if (task.isDoing === true) {
                doingTask.push(task);
            } else {
                beforeStartTasks.push(task);
            }
        }
        // 終了済みタスクは開始時間でソート
        doneTasks.sort((a: Task, b: Task) => {
            if (a.startTime == null) {
                return 1;
            } else if (b.startTime == null) {
                return -1;
            } else {
                return a.startTime.getTime() - b.startTime.getTime();
            }
        });
        // 開始前タスクはsortNoでソート
        beforeStartTasks.sort((a: Task, b: Task) => {
            if (a.sortNo == null) {
                return 1;
            } else if (b.sortNo == null) {
                return -1;
            } else {
                return a.sortNo - b.sortNo;
            }
        });

        // 開始前タスクの中の一番目のタスクに「次のタスクフラグ」をつける
        if (beforeStartTasks.length > 0) {
            beforeStartTasks[0].isNext = true;
        }

        this.tasks_ = doneTasks.concat(doingTask).concat(beforeStartTasks);

        // 番号を振り直す
        for (const [index, item] of this.tasks_.entries()) {
            item.sortNo = index + 1;
        }

        // セーブ対象を選定
        for (const task of this.tasks_) {
            if (task.sortNo !== task.oldSortno) {
                task.needSave = true;
            }
        }
    }

    private backupSortNo(): void {
        for (const task of this.tasks_) {
            task.backupSortNo();
        }
    }
}
