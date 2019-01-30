import uuid from 'uuid'
import DateUtil from '@/util/DateUtil'

export default class Repeat {
  public get id(): string {
    return this.id_
  }
  public set id(value: string) {
    this.id_ = value
  }
  public get title(): string {
    return this.title_
  }
  public set title(value: string) {
    this.title_ = value
  }
  public get estimateTime(): number {
    return this.estimateTime_
  }
  public set estimateTime(value: number) {
    this.estimateTime_ = value
  }
  public get from(): Date {
    return this.from_
  }
  public set from(value: Date) {
    value.setHours(0, 0, 0, 0)
    this.from_ = value
  }
  public get day(): string[] {
    return this.day_
  }
  public set day(value: string[]) {
    this.day_ = value
  }

  private id_: string

  private title_: string

  private estimateTime_: number

  private section_: Date

  public get section(): Date {
    return this.section_
  }
  public set section(value: Date) {
    this.section_ = value
  }

  /**
   * リピートの開始日
   * セットされたDateオブジェクトの時分秒は自動的に0に修正する
   */
  private from_: Date

  /** 繰り返し曜日 */
  private day_: string[]

  constructor() {
    this.id_ = uuid()
    this.title_ = ''
    this.from_ = new Date()
    this.day_ = []
    this.estimateTime_ = 0
    this.section_ = DateUtil.getMinDate()
  }

  /**
   * このリピートオブジェクトから新しいリピートオブジェクトをコピーして作成する
   * idは新しい番号を採番する
   */
  public copyNew(): Repeat {
    // New時に新しい番号は自動採番
    const newRepeat = new Repeat()
    newRepeat.title = this.title_
    newRepeat.day = this.day_
    newRepeat.from = this.from_
    newRepeat.estimateTime = this.estimateTime_
    newRepeat.section = this.section_
    return newRepeat
  }

}
