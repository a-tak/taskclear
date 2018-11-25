export default class Util {
    static isNumber(value: string | number): boolean
    {
        return !isNaN(Number(value.toString()));
    }

}
