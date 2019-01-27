import { Z_BEST_SPEED } from 'zlib';

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
    let str: string = timeString
    str = str.replace(':', '').trim()
    let retTime: string = ''
    // JSのsubstringの終了位置は実際は一つ前の桁までしか取れない!
    if (str.length === 3) {
      retTime = `${str.substring(0, 1)}:${str.substring(1, 3)}`
    } else if (str.length === 4) {
      retTime = `${str.substring(0, 2)}:${str.substring(2, 4)}`
    } else {
      throw new Error(`timeStringの形式が不正です(${timeString})`)
    }

    const retDate: Date = new Date(baseDate)
    if (firstSectionDate != undefined) {
      const firstSectionTime: Date = DateUtil.clearDate(firstSectionDate)
      const inputTime: Date =
        new Date(DateUtil.getMinDate().getFullYear + '/' +
        DateUtil.getMinDate().getMonth() + '/' +
        DateUtil.getMinDate().getDate() + ' ' + retTime)
      if (inputTime.getTime() < firstSectionTime.getTime()) {
        retDate.setDate(retDate.getDate() + 1)
      }
    }

    const dateStr: string = `${retDate.getFullYear()}/${retDate.getMonth() + 1}/${retDate.getDate()} ${retTime}`
    return new Date(dateStr)
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
}
