import { v4 as uuid } from 'uuid'

/**
 * タスクを表すクラス
 * ここに項目を追加する場合はFirestoreUtilのconverToTaskにもエラーが出ないけど追加が必要
 */
export default class Task {

  /**
   * タスククラスのコンストラクタ
   * idは自動生成する
   * @param date タスクの日付
   * @param title タスクのタイトル
   */

  private id_: string
  private date_: Date
  private title_: string
  private isDoing_: boolean
  private startTime_: Date | undefined
  private endTime_: Date | undefined
  private estimateTime_: number
  private repeatId_: string
  private sortNo_: number
  private oldSortno_: number
  private isDeleted_: boolean
  private isNext_: boolean
  private needSave_: boolean
  private estimateSeparateStart_: boolean
  private estimateSeparateEnd_: boolean
  private createTime_: Date
  private updateTime_: Date
  private note_: string
  private isProcessing_: boolean

  constructor(date: Date, title: string) {
    this.id_ = date.getFullYear() +
               (date.getMonth() + 1).toString().padStart(2, '0') +
               date.getDate().toString().padStart(2, '0') +
               '_' + uuid()
    this.date_ = new Date(date)
    this.title_ = title
    this.isDoing_ = false
    this.startTime_ = undefined
    this.endTime_ = undefined
    this.estimateTime_ = 0
    this.repeatId_ = ''
    this.sortNo_ = 999
    this.oldSortno_ = 999
    this.isDeleted_ = false
    this.isNext_ = false
    // フラグセット忘れで保存されないのを多少防ぐためにtrueで
    this.needSave_ = true
    this.estimateSeparateStart_ = false
    this.estimateSeparateEnd_ = false
    this.createTime_ = new Date()
    this.updateTime_ = this.createTime_
    this.note_ = ''
    this.isProcessing_ = false
  }

  get id(): string { return this.id_ }
  set id(value: string) { this.id_ = value }
  get date(): Date { return this.date_ }
  set date(value: Date) { this.date_ = value }
  get title(): string { return this.title_ }
  set title(value: string) { this.title_ = value }
  get isDoing(): boolean { return this.isDoing_ }
  set isDoing(value: boolean) { this.isDoing_ = value }
  get startTime(): Date | undefined { return this.startTime_ }
  set startTime(value: Date | undefined) { this.startTime_ = value }
  get endTime(): Date | undefined { return this.endTime_ }
  set endTime(value: Date | undefined) { this.endTime_ = value }

  public get note(): string {
    return this.note_
  }
  public set note(value: string) {
    this.note_ = value
  }
  public get repeatId(): string {
    return this.repeatId_
  }
  public set repeatId(value: string) {
    this.repeatId_ = value
  }

  /**
   * 削除フラグ(論理削除)
   */
  public get isDeleted(): boolean {
    return this.isDeleted_
  }
  public set isDeleted(value: boolean) {
    this.isDeleted_ = value
  }
  /**
   * 見積時間(分)
   */
  get estimateTime(): number {return this.estimateTime_ }
  set estimateTime(value: number) { this.estimateTime_ = value }
  /**
   * 実績時間(分)
   */
  get actualTime(): number {
    if (this.startTime_ == undefined) { return 0 }
    // 終了時間が入っていないときは今の時間を使う
    let endTime: Date = new Date()
    if (this.endTime_ != undefined) { endTime = this.endTime_ }
    return Math.floor((endTime.getTime() - this.startTime_.getTime()) / 1000 / 60)
  }

  /**
   * 作成日　オブジェクトの作成日を入れる
   */
  public get createTime(): Date {
    return this.createTime_
  }
  public set createTime(value: Date) {
    this.createTime_ = value
  }

  /**
   * 更新日 最初はオブジェクトの作成日、以後はDB保存日を入れる
   */
  public get updateTime(): Date {
    return this.updateTime_
  }
  public set updateTime(value: Date) {
    this.updateTime_ = value
  }
  /**
   * ソート順
   */
  public get sortNo(): number {
    return this.sortNo_
  }
  public set sortNo(value: number) {
    this.sortNo_ = value
  }

  /**
   * ソート前のソート順
   * ソート順番が変更されたどうかの判断に使う
   */
  public get oldSortno(): number {
    return this.oldSortno_
  }
  public set oldSortno(value: number) {
    this.oldSortno_ = value
  }

  /**
   * 次実行するタスクフラグ
   * ショートカットキーで次のタスクまでスクロールするために使用
   * 保存しない
   */
  public get isNext(): boolean {
    return this.isNext_
  }
  public set isNext(value: boolean) {
    this.isNext_ = value
  }

  /**
   * 保存が必要かどうかの判断に使用するフラグ
   * trueが付いているTaskのみ保存する
   */
  public get needSave(): boolean {
    return this.needSave_
  }
  public set needSave(value: boolean) {
    this.needSave_ = value
  }

  /**
   * 一日の見積時間を計算開始するタスク
   * このフラグがtrueになっているタスク以降のタスク見積時間を計上する
   */
  public get estimateSeparateStart(): boolean {
    return this.estimateSeparateStart_
  }
  public set estimateSeparateStart(value: boolean) {
    this.estimateSeparateStart_ = value
  }

  /**
   * 一日の見積時間を表示する際の区切り
   * このフラグがtrueになっている「タスクより前」のタスクの見積時間を一日の見積時間として計上する
   */
  public get estimateSeparateEnd(): boolean {
    return this.estimateSeparateEnd_
  }
  public set estimateSeparateEnd(value: boolean) {
    this.estimateSeparateEnd_ = value
  }

  /**
   * 処理中フラグ
   * 開始・終了ボタンの二重イベント防止
   * DBには保存しない表示制御用
   */
  public get isProcessing(): boolean {
    return this.isProcessing_
  }
  public set isProcessing(value: boolean) {
    this.isProcessing_ = value
  }

  /**
   * 中断タスクを作成
   * 元のタスクの見積から実績を引いた残り時間を入れて新たなタスクを戻す
   */
  public createPauseTask(): Task {
    const newTask: Task = new Task(this.date_, this.title)
    newTask.isDoing = false
    newTask.startTime = undefined
    newTask.endTime = undefined
    let estimate: number = this.estimateTime - this.actualTime
    if (estimate < 0) { estimate = 0 }
    newTask.estimateTime = estimate
    newTask.repeatId = ''
    // 次の行にコピーしたものは表示
    newTask.sortNo = this.sortNo_
    // ソート直前に更新されるのでどうでもいいが一応コピー
    newTask.oldSortno = this.oldSortno_
    // 削除したタスクの中断タスクが作られても意味がないはずなので、常にfalseにする
    newTask.isDeleted = false
    // ソートにより自動設定されるので仮にfalseを指定
    newTask.isNext = false
    // 新規に作成されるタスクなのでSave対象にする
    newTask.needSave = true
    newTask.estimateSeparateStart = this.estimateSeparateStart
    // 区切りタスクを開始したがイレギュラーで前の作業に戻ることを想定して元タスクのフラグをコピーする
    newTask.estimateSeparateEnd = this.estimateSeparateEnd
    // メモはそのままコピー
    newTask.note = this.note_
    // 処理フラグは常にオフ
    newTask.isProcessing = false
    return newTask
  }

  /**
   * タスクをコピー
   * キャンセル機能などで元の値を待避するために使用
   * IDも同じものがコピーされるので重複が起きないように注意が必要
   */
  public clone(): Task {
    const newTask: Task = new Task(this.date_, this.title)
    newTask.id = this.id_
    newTask.date = new Date(this.date_)
    newTask.isDoing = this.isDoing_
    if (this.startTime_ !== undefined) {
      newTask.startTime = new Date(this.startTime_)
    } else {
      newTask.startTime = undefined
    }
    if (this.endTime_ !== undefined) {
      newTask.endTime = new Date(this.endTime_)
    } else {
      newTask.endTime = undefined
    }
    newTask.estimateTime = this.estimateTime_
    newTask.repeatId = this.repeatId_
    newTask.sortNo = this.sortNo_
    newTask.oldSortno = this.oldSortno_
    newTask.isDeleted = this.isDeleted_
    newTask.isNext = this.isNext_
    newTask.needSave = this.needSave_
    newTask.estimateSeparateStart = this.estimateSeparateStart_
    newTask.estimateSeparateEnd = this.estimateSeparateEnd_
    newTask.createTime = new Date(this.createTime_)
    newTask.updateTime = new Date(this.updateTime_)
    newTask.note = this.note_
    // タイミングによって変なフラグ状態をコピーしてしまいたくないので常にFalseにしてみる
    newTask.isProcessing = false

    return newTask

  }

  /**
   * 現在のソートNoを待避する
   */
  public backupSortNo(): void {
    this.oldSortno_ = this.sortNo
  }

}
