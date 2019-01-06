import uuid from 'uuid';

export default class Section {

    private title_: string = '';
    private startTime_: Date | null = null;
    private id_: string = uuid();
    private updateTime_: Date = new Date();
    private createTime_: Date = new Date();

    public get id(): string {
      return this.id_;
    }
    public set id(value: string) {
      this.id_ = value;
    }
    get title(): string { return this.title_; }
    set title(value: string) { this.title_ = value; }
    get startTime(): Date | null { return this.startTime_; }
    set startTime(value: Date | null) {
      this.startTime_ = this.clearDate(value);
    }
    public get updateTime(): Date {
      return this.updateTime_;
    }
    public set updateTime(value: Date) {
      this.updateTime_ = value;
    }
    public get createTime(): Date {
      return this.createTime_;
    }
    public set createTime(value: Date) {
      this.createTime_ = value;
    }

    public clone(): Section {
      const section = new Section();
      section.id = this.id_;
      section.startTime = this.startTime_;
      section.title = this.title_;
      return section;
    }

    private clearDate(date: Date | null): Date {
      if (date == null) {
        date = new Date('1990-01-01 0:00:00');
        return date;
      }
      const ret: Date = date;
      ret.setFullYear(1990, 0, 1);
      return ret;
    }

}
