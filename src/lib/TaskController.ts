import firebase,{ firestore } from 'firebase';
import Task from './Task';
import ITask from '@/ITask';

// Taskオブジェクトを束ねるクラス
export default class TaskController {
    
    private tasks_: Task[] = [];
    
    get tasks(): Task[] { return this.tasks_ }
    set tasks(value: Task[]) { this.tasks_ = value }

    /**
     * Firestore保存用のオブジェクトリテラルを取得する
     */
    createFirestoreLiteral(): ITask[] {
        let literals: ITask[] = []; 
        for (const task of this.tasks_) {
            let literal: ITask = {
                id: task.id,
                date: firestore.Timestamp.fromDate(task.date),
                title: task.title,
                isDoing: task.isDoing,
                startTime: null,
                endTime: null,
                estimateTime: task.estimateTime,
                actualTime: task.actualTime,
                repeatId: task.repeatId,
            }
            if (task.startTime!=null) { literal.startTime = firestore.Timestamp.fromDate(task.startTime)};
            if (task.endTime!=null) { literal.endTime = firestore.Timestamp.fromDate(task.endTime)};

            literals.push(literal);
        }
       return literals;
    }

    /**
     * Firestoreからのオブジェクト配列をTaskの配列に変換して自分にセットする
     * Firestoreからのデータ読み込み時に使用する
     * @param fsObjs 
     */
    loadFirestoreLiteral(fsObjs: ITask[]) : void {
        this.tasks_ = [];
        for (const fsobj of fsObjs) {
            let task = new Task(fsobj.date.toDate(),fsobj.title);
            task.id = fsobj.id;
            task.isDoing = fsobj.isDoing;
            //過去データでフィールドが無いものはundefinedが返る為の対策
            if (fsobj.estimateTime == undefined) {
                task.estimateTime = 0;
            }else{
                task.estimateTime = fsobj.estimateTime;
            }

            if (fsobj.startTime !=null) {
                task.startTime = fsobj.startTime.toDate();
            }else {
                task.startTime = null;
            }
            if (fsobj.endTime !=null) {
                task.endTime = fsobj.endTime.toDate();
            }else {
                task.endTime = null;
            }
            task.repeatId = fsobj.repeatId;
            this.tasks_.push(task);
        }
    }

    /**
     * 見積時間の合計(分)を返す
     */
    getEstimateSum() : number {
        let sum : number = 0;
        for (const task of this.tasks_) {
            //終了タスクの見積を含めると合計が何倍にもなるので除外する
            if (task.endTime == null) {
                sum = sum + task.estimateTime;
            }
        }
        return sum;
    }

    sort() : void {
        this.tasks_.sort(function(a: Task,b: Task){
            if (a.startTime == null) {
                return 1;
            }else if(b.startTime == null) {
                return -1;
            } else {
                return a.startTime.getTime() - b.startTime.getTime();
            }
        });

    }
}