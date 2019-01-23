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
   * 時間文字列からDateオブジェクトを生成して返す
   * @param baseDate 日付を表すDateオブジェクト
   * @param timeString 時間文字列(hhmm)。「:」は取り除く。
   */
  public static getDateObject(baseDate: Date, timeString: string): Date {
    let str: string = timeString
    str = str.replace(':', '').trim()
    let retStr: string = ''
    // JSのsubstringの終了位置は実際は一つ前の桁までしか取れない!
    if (str.length === 3) {
      retStr = `${str.substring(0, 1)}:${str.substring(1, 3)}`
    } else if (str.length === 4) {
      retStr = `${str.substring(0, 2)}:${str.substring(2, 4)}`
    } else {
      throw new Error(`timeStringの形式が不正です(${timeString})`)
    }
    const dateStr: string = `${baseDate.getFullYear()}/${baseDate.getMonth() + 1}/${baseDate.getDate()} ${retStr}`
    return new Date(dateStr)
  }

  public static clearDate(date: Date | undefined): Date {
    if (date == undefined) {
      date = new Date('1990-01-01 0:00:00')
      return date
    }
    const ret: Date = date
    ret.setFullYear(1990, 0, 1)
    return ret
  }
}
