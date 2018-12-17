import uuid from 'uuid';

export default class Section {

    private title_: string;
    private startTime_: Date;
    private id_: string = uuid();

    constructor(title: string, startTime: Date) {
        this.title_ = title;
        this.startTime_ = this.clearDate(startTime);
    }

    public get id(): string {
      return this.id_;
    }
    get title(): string { return this.title_; }
    set title(value: string) { this.title_ = value; }
    get startTime(): Date { return this.startTime_; }
    set startTime(value: Date ) {
      this.startTime_ = this.clearDate(value);
    }

    private clearDate(date: Date): Date {
      const ret: Date = date;
      ret.setFullYear(1990, 0, 1);
      return ret;
    }

}
