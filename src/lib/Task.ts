import uuid from 'uuid';

export default class Task {

    /**
     * タスククラスのコンとすトラクタ
     * idは自動生成する
     * @param date タスクの日付
     * @param title タスクのタイトル
     */
    constructor(date:Date, title: string) {
        this.id_ = uuid();
        this.date_ = date;
        this.title_ = title;
        this.isDoing_ = false;
        this.startTime_ = null;
        this.endTime_ = null;
        this.estimateTime_ = 0;
        this.repeatId_ = "";
    }

    private id_: string;
    private date_: Date;
    private title_ : string;
    private isDoing_: boolean;
    private startTime_: Date | null;
    private endTime_: Date | null;
    private estimateTime_ : number;

    get id(): string { return this.id_ }
    set id(value: string) { this.id_ = value }
    get date(): Date { return this.date_ }
    set date(value: Date) { this.date_ = value }
    get title(): string { return this.title_ }
    set title(value: string) { this.title_ = value }
    get isDoing(): boolean { return this.isDoing_ }
    set isDoing(value: boolean) { this.isDoing_ = value }
    get startTime(): Date | null { return this.startTime_ }
    set startTime(value: Date | null) { this.startTime_ = value }
    get endTime(): Date | null { return this.endTime_ }
    set endTime(value: Date | null) { this.endTime_ = value }

    private repeatId_ : string;
    public get repeatId() :  string {
        return this.repeatId_;
    }
    public set repeatId(value : string) {
        this.repeatId_ = value;
    }

    /**
     * 見積時間(分)
     */
    get estimateTime(): number {return this.estimateTime_}
    set estimateTime(value: number) { this.estimateTime_ = value }
    /**
     * 実績時間(分)
     */
    get actualTime(): number { 
        if (this.startTime_ == null) return 0;
        //終了時間が入っていないときは今の時間を使う
        let endTime: Date = new Date();
        if (this.endTime_ != null) endTime = this.endTime_; 
        return Math.floor((endTime.getTime() - this.startTime_.getTime())/1000/60);
    }

    /**
     * 中断タスクを作成
     * 元のタスクの見積から実績を引いた残り時間を入れて新たなタスクを戻す
     */
    createPauseTask(): Task {
        let newTask: Task = new Task(this.date_,this.title);
        newTask.isDoing = false;
        newTask.startTime = null;
        newTask.endTime = null;
        let estimate: number = this.estimateTime - this.actualTime;
        if (estimate < 0) estimate = 0;
        newTask.estimateTime = estimate;
        newTask.repeatId = "";

        return newTask;
    }

    /**
     * タスクをコピー
     * キャンセル機能などで元の値を待避するために使用
     * IDも同じものがコピーされるので重複が起きないように注意が必要
     */
    copy(): Task {
        let newTask: Task = new Task(this.date_,this.title);
        newTask.id = this.id_;
        newTask.date = this.date_;
        newTask.isDoing = this.isDoing_;
        newTask.startTime = this.startTime_;
        newTask.endTime = this.endTime_;
        newTask.estimateTime = this.estimateTime_;
        newTask.repeatId = this.repeatId_;

        return newTask;

    }

}
