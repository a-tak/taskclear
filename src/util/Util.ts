export default class Util {
  public static isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()))
  }

  /**
   * Null Undefinedチェック
   * NullまたはUndefinedならば例外を発生する。コンソールで見ると若干undefinedの発生場所がわかりづらいかもしれない。
   * @param val チェック対象の変数
   */
  public static assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
      throw new Error(
        `Error! Expected 'val' to be defined, but received ${val}`,
      )
    }
  }
}
