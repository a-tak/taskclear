import uuid from 'uuid';

export default class Section {

    private title_: string = '';
    private startTime_: Date | null = null;
    private id_: string = uuid();

    public get id(): string {
      return this.id_;
    }
    get title(): string { return this.title_; }
    set title(value: string) { this.title_ = value; }
    get startTime(): Date | null { return this.startTime_; }
    set startTime(value: Date | null) {
      this.startTime_ = this.clearDate(value);
    }

    private clearDate(date: Date | null): Date {
      if (date === null) {
        date = new Date('1990-01-01 0:00:00');
        return date;
      }
      const ret: Date = date;
      ret.setFullYear(1990, 0, 1);
      return ret;
    }

}
