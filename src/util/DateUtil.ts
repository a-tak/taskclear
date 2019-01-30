import Section from '@/lib/Section'
import Store from '@/store/Store'

export default class DateUtil {
  // 現地時間のyyyy-mm-dd形式の文字列を返す
  public static getDateString(d: Date): string {
    return `${d.getFullYear().toString()}-${
      ('0' + (d.getMonth() + 1).toString()).slice(-2)}-${
      ('0' + d.getDate().toString()).slice(-2)}`
  }

  /**
   * 時間の文字列を返す
   * @param d 変換したいDateオブジェクト
   * @param zeroPadding 時間のゼロパディングする場合はtrueを指定
   */
  public static getTimeString(d: Date, zeroPadding: boolean = false): string {
    // なんでundifinedも通るし、stringの引数が渡ってくるの?
    if (d === undefined) { return ''; }
    if (zeroPadding === false) {
      return `${d.getHours().toString()}:${('0' + d.getMinutes().toString()).slice(-2)}`
    } else {
      return `${('0' + d.getHours().toString()).slice(-2)}:${('0' + d.getMinutes().toString()).slice(-2)}`
    }
  }

  /**
   * 4桁の時間を表す文字列を返す
   * @param date
   */
  public static get4digitTime(date: Date): string {
    return this.getTimeString(date, true).replace(':', '')
  }

  /**
   * 3-4桁の時間文字列からDateオブジェクトを生成して返す
   * 「300」→「3:00」
   * 「1200」→「12:00」
   * 「13:00」→「13:00」
   * @param baseDate 日付を表すDateオブジェクト
   * @param timeString 時間文字列(hhmm)。「:」は取り除く。
   * @param firstSectionDate 一日の区切り時間を渡すことでそれを考慮した日付加算を行って結果を返す
   */
  public static getDateObject(baseDate: Date, timeString: string, firstSectionDate?: Date): Date {
    const timeDate: Date | undefined = this.getDateByTimeString(timeString)
    if (timeDate != undefined) {
      return this.getDateObjectByDate(baseDate, timeDate, firstSectionDate)
    } else {
      throw new Error('timeString undefined error!')
    }
  }

  public static getDateObjectByDate(baseDate: Date, timeDate: Date, firstSectionDate?: Date): Date {
    const retDate: Date = new Date(baseDate)
    if (firstSectionDate != undefined) {
      const firstSectionTime: Date = DateUtil.clearDate(firstSectionDate)
      const d: Date = DateUtil.getMinDate()
      const inputTime: Date =
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), timeDate.getHours(), timeDate.getMinutes())
      if (inputTime.getTime() < firstSectionTime.getTime()) {
        retDate.setDate(retDate.getDate() + 1)
      }
    }
    return new Date(
      retDate.getFullYear(), retDate.getMonth(), retDate.getDate(), timeDate.getHours(), timeDate.getMinutes() )
  }

  /**
   * 渡されたDateオブジェクトの日付部分のみをリセット(1970/1/1)する
   * getTime()で0が返るようになる
   * @param date 対象のDateオブジェクト
   */
  public static clearDate(date: Date | undefined): Date {
    if (date == undefined) {
      return this.getMinDate()
    }
    const ret: Date = date
    ret.setFullYear(1970, 0, 1)
    return ret
  }

  /**
   * 渡されたDateオブジェクトの時間部分のみをリセット(0:00)する
   */
  public static clearTime(date: Date | undefined): Date {
    if (date == undefined) {
      return this.getMinDate()
    }
    const ret: Date = date
    ret.setHours(0)
    ret.setMinutes(0)
    ret.setMilliseconds(0)
    return ret
  }

  /**
   * 1970年1月1日がセットされたDateオブジェクトを返す
   * デフォルトでこれをセットする場合が多いのでメソッド化
   * readonlyも考えたがオブジェクトの中身書き換えられそうなので、毎回newして返す形にした
   */
  public static getMinDate(): Date {
    return new Date('1970-01-01 0:00:00')
  }

  /**
   * 一日の開始時間を返す
   */
  public static getFirstSectionTime(): Date {
    const sections: Section[] = Store.getters['section/sections']
    if (sections.length > 0) {
      return sections[0].startTime
    } else {
      // セクションの設定がなければ0:00をセットして返す
      return DateUtil.getMinDate()
    }
  }

  /**
   * 指定した日付の開始と終了時間を返す
   * @param date 対象の日付
   */
  public static getDateFromToTime(date: Date): {from: Date, to: Date} {
    const startTime: Date = this.getFirstSectionTime()
    const from: Date = new Date(date)
    from.setHours(startTime.getHours())
    from.setMinutes(startTime.getMinutes())
    from.setMilliseconds(0)
    const to: Date = new Date(from)
    to.setDate(to.getDate() + 1)
    return {from, to}
  }

  /**
   * 対象日付と時間からタスクの日付を計算する
   * @param taskDate 対象日付
   * @param taskTime 対象時間
   */
  public static calcTaskDate(taskDate: Date, taskTime: Date | undefined): Date {
    console.log(`${taskDate} / ${taskTime}`)
    // 何も指定がなければ現在開いている画面の日付の0:00をタスクの日付としてセット
    let newDate: Date = DateUtil.clearTime(new Date(taskDate))

    // 開始セクションの時間を取得
    let firstSectionTime: Date = DateUtil.getMinDate()
    const sections: Section[] = Store.getters['section/sections']
    if (sections.length > 0) {
      firstSectionTime = new Date(sections[0].startTime)
    } else {
      firstSectionTime.setHours(0)
      firstSectionTime.setMinutes(0)
      firstSectionTime.setMilliseconds(0)
    }

    if (taskTime != undefined) {
      // 指定された時間に沿ってdateの日付と時間を変更する
      newDate =
        DateUtil.getDateObjectByDate(new Date(taskDate),
        taskTime,
          firstSectionTime)
          console.log(`taskTimeセット! ${taskDate} / ${taskTime} / ${firstSectionTime} / ${newDate}`)
    } else {
      // 入力がなければ1日の開始セクションの時間をセットする
      newDate.setHours(firstSectionTime.getHours())
      newDate.setMinutes(firstSectionTime.getMinutes())
      newDate.setMilliseconds(firstSectionTime.getMilliseconds())
    }
    return newDate

  }

  /**
   * 3-4桁の時間文字列からDateオブジェクトを生成して返す
   * 文字列指定が無い場合はUndefinedを返す
   * 「300」→「3:00」
   * 「1200」→「12:00」
   * 「13:00」→「13:00」
   * @param timeString 時間文字列(hhmm)。「:」は取り除く。   * @param timeString 解析対象の文字列
   */
  public static getDateByTimeString(timeString: string): Date | undefined {
    if (timeString === '') {
      return undefined
    }
    let str: string = timeString
    str = str.replace(':', '').trim()
    const retDate: Date = this.getMinDate()
    // JSのsubstringの終了位置は実際は一つ前の桁までしか取れない!
    if (str.length === 3) {
      retDate.setHours(Number(str.substring(0, 1)))
      retDate.setMinutes(Number(str.substring(1, 3)))
    } else if (str.length === 4) {
      retDate.setHours(Number(str.substring(0, 2)))
      retDate.setMinutes(Number(str.substring(2, 4)))
    } else {
      throw new Error(`timeStringの形式が不正です(${timeString})`)
    }
    return retDate
  }

}
