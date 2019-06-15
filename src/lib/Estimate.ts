import DateUtil from '@/util/DateUtil'

export default class Estimate {
  private date_: Date = new Date()
  public get date(): Date {
    return this.date_
  }
  public set date(v: Date) {
    this.date_ = v
  }

  /**
   * M/Dの形式で日付文字列を返す
   */
  public get dateStr(): string {
    return `${this.date_.getMonth() + 1}/${this.date_.getDate()}`
  }

  private dayLabel_: string = ''
  public get dayLabel(): string {
    return this.dayLabel_
  }
  public set dayLabel(v: string) {
    this.dayLabel_ = v
  }

  private estimateTime_: string = ''
  public get estimateTime(): string {
    return this.estimateTime_
  }
  public set estimateTime(v: string) {
    this.estimateTime_ = v
  }
}
