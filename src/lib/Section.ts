import { v4 as uuid} from 'uuid'
import DateUtil from '@/util/DateUtil'

export default class Section {

  private title_: string
  private startTime_: Date
  private id_: string
  private updateTime_: Date
  private createTime_: Date

  /**
   * コンストラクタ
   * startTimeはundefined状態を許容しないようにした為初期値を入れた
   */
  constructor() {
    this.title_ = ''
    this.startTime_ = DateUtil.clearDate(new Date())
    this.id_ = uuid()
    this.updateTime_ = new Date()
    this.createTime_ = new Date()
  }

  public get id(): string {
    return this.id_
  }
  public set id(value: string) {
    this.id_ = value
  }
  get title(): string { return this.title_ }
  set title(value: string) { this.title_ = value }
  get startTime(): Date { return this.startTime_ }
  set startTime(value: Date) {
    this.startTime_ = value
  }
  public get updateTime(): Date {
    return this.updateTime_
  }
  public set updateTime(value: Date) {
    this.updateTime_ = value
  }
  public get createTime(): Date {
    return this.createTime_
  }
  public set createTime(value: Date) {
    this.createTime_ = value
  }

  public clone(): Section {
    const section = new Section()
    section.id = this.id_
    section.startTime = this.startTime_
    section.title = this.title_
    return section
  }
}
