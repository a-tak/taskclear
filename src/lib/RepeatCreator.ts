import Repeat from './Repeat';
import FirebaseUtil from '@/util/FirebaseUtil';
import TaskController from './TaskController';
import Task from './Task';

export default class RepeatCreator {

    private uid_: string;
    private targetDate_: Date;

    /**
     * RepeatCreatorのコンストラクタ
     * 
     * 対象のuidと作成する日の基準日を指定
     * @param uid 
     * @param targetDate 
     */
    constructor (uid: string, targetDate: Date) {
        this.uid_ = uid;
        //時間は0:00にしておく
        targetDate.setHours(0,0,0,0);
        this.targetDate_ = targetDate;
    }
    
    /**
     * 指定日数分のリピートタスクをリピートタスクのマスタを元に作成する
     * 
     * 指定されたカウント分のリピートタスクが完了したらPromiseで応答するので、呼び出し元は待ちたければそれを使って待つ
     * 当日予定分は待って同期的に次の処理が必要だが、未来の分は通常は待つ必要はないはず
     * @param count 何日先までリピートタスクを作成するかの指定
     */
    async creaetRepeat(count: number) : Promise<void> {
        //全処理完了確認用
        let promises: Promise<void>[] = [];

        //リピートタスク一覧を読む
        let repeats: Repeat[] = await this.readRepeat(this.targetDate_);

        //日付毎に処理 
        for (let index = 0; index < count; index++) {
            //日付を進める
            let targetDate: Date = new Date(this.targetDate_);
            targetDate.setDate(this.targetDate_.getDate() + index);

            //日付毎の処理を非同期で実施
            promises.push(this.createRepeatSub(repeats, targetDate));
        }

        //すべてのPromise完了を待つ
        await Promise.all(promises);
        return;
    }

    /**
     * リピートタスクのメイン処理
     * 日付毎に非同期で処理する。指定された日にリピートタスクがあるか確認してなければ作成するまでやる
     * @param repeats リピートタスク一覧が入った配列
     * @param targetDate 
     */
    async createRepeatSub(repeats: Repeat[], targetDate: Date) : Promise<void> {
        //全処理完了確認用
        let promises: Promise<void>[] = [];
        let tc:TaskController = await FirebaseUtil.loadTasks(this.uid_,targetDate);

        for (const repeat of repeats) {
            if (this.isMakeRepeat(repeat, targetDate)) {
                //既にリピートタスクがあるかを判断
                if (!this.isExsistRepeat(repeat,tc.tasks)){
                    //なければ作成
                    promises.push(this.createTask(repeat, targetDate));
                }
            }
            //次のリピートタスク
        }

        //一日分のリピート全部が終わるまで待つ
        await Promise.all(promises);
        return
    }

    /**
     * リピートタスクを作る
     * @param repeat 
     * @param targetDate 
     */
    private async createTask(repeat: Repeat, targetDate: Date) : Promise<void> {
        let task = new Task(targetDate, repeat.title);
        task.repeatId = repeat.id;
        task.isDoing = false;
        task.startTime = null;
        task.endTime = null;
        task.estimateTime = repeat.estimateTime;
        await FirebaseUtil.addTask(this.uid_, targetDate, task);
        return
    }

    /**
     * Task配列の中に既にリピートタスクが存在するか
     * @param repeat 確認したいリピートタスク(idでもいいかもしれないけど)
     * @param tasks 検索対象のTaskの配列
     */
    private isExsistRepeat(repeat: Repeat,tasks: Task[]) : boolean {
        for (const task of tasks) {
            console.log(`itask id ${task.repeatId} repeat id = ${repeat.id}`);
            if (task.repeatId === repeat.id) return true;
        }
        return false;
    }

    /**
     *  ターゲットの日にリピートタスクを作る必要があるか曜日とFromで判断
     *  リピート取得時もfromで絞り込んでいるが、日付を進めていく事で条件が変わってくるためここでも見る
     * @param repeat 
     * @param targetDate 
     */
    private isMakeRepeat(repeat:Repeat, targetDate: Date) : boolean {
        //まだ開始されないリピートタスクは作らない
        if (targetDate < repeat.from) return false;
        return repeat.day.includes(targetDate.getDay().toString());
        
    }

    private async readRepeat(targetDate: Date) : Promise<Repeat[]> {
        //取得の際に日付を指定してtargetDate以降がfromになっているリピート設定だけ取得し無駄に過去のリピートをとらない
        return FirebaseUtil.loadRepeatByDateFrom(this.uid_, targetDate);
    } 
}