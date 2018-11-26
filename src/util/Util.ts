export default class Util {
    public static isNumber(value: string | number): boolean {
        return !isNaN(Number(value.toString()));
    }

}
