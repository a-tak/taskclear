import { firestore } from 'firebase';
import Task from './Task';
import ITask from '@/lib/ITask';

// Taskオブジェクトを束ねるクラス
export default class TaskController {

    private tasks_: Task[] = [];

    get tasks(): Task[] { return this.tasks_; }
    set tasks(value: Task[]) { this.tasks_ = value; }

    /**
     * Firestore保存用のオブジェクトリテラルを取得する
     */
    public createFirestoreLiteral(): ITask[] {
        const literals: ITask[] = [];
        for (const task of this.tasks_) {
            const literal: ITask = {
                id: task.id,
                date: firestore.Timestamp.fromDate(task.date),
                title: task.title,
                isDoing: task.isDoing,
                startTime: null,
                endTime: null,
                estimateTime: task.estimateTime,
                actualTime: task.actualTime,
                repeatId: task.repeatId,
                sortNo: task.sortNo,
            };
            if (task.startTime != null) { literal.startTime = firestore.Timestamp.fromDate(task.startTime); }
            if (task.endTime != null) { literal.endTime = firestore.Timestamp.fromDate(task.endTime); }

            literals.push(literal);
        }
        return literals;
    }

    /**
     * Firestoreからのオブジェクト配列をTaskの配列に変換して自分にセットする
     * Firestoreからのデータ読み込み時に使用する
     * @param fsObjs
     */
    public loadFirestoreLiteral(fsObjs: ITask[]): void {
        this.tasks_ = [];
        for (const fsobj of fsObjs) {
            const task = new Task(fsobj.date.toDate(), fsobj.title);
            task.id = fsobj.id;
            task.isDoing = fsobj.isDoing;
            // 過去データでフィールドが無いものはundefinedが返る為の対策
            if (fsobj.estimateTime === undefined) {
                task.estimateTime = 0;
            } else {
                task.estimateTime = fsobj.estimateTime;
            }

            if (fsobj.startTime != null) {
                task.startTime = fsobj.startTime.toDate();
            } else {
                task.startTime = null;
            }
            if (fsobj.endTime != null) {
                task.endTime = fsobj.endTime.toDate();
            } else {
                task.endTime = null;
            }
            task.repeatId = fsobj.repeatId;
            task.sortNo = fsobj.sortNo;
            this.tasks_.push(task);
        }
    }

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
        // 終了タスクと開始中タスクと開始前タスクをわける
        const doneTasks: Task[] = [];
        const doingTask: Task[] = [];
        const beforeStartTasks: Task[] = [];

        for (const task of this.tasks_) {
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

        this.tasks_ = doneTasks.concat(doingTask).concat(beforeStartTasks);

        // 番号を振り直す
        for (const [index, item] of this.tasks_.entries()) {
            item.sortNo = index + 1;
        }
    }
}
