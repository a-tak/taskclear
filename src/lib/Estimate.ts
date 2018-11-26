import DateUtil from '@/util/DateUtil';

export default class Estimate {
    private  date_: Date = new Date();
    public get date(): Date {
        return this.date_;
    }
    public set date(v: Date) {
        this. date_ = v;
    }
    public get dateStr(): string {
        return DateUtil.getDateString(this.date_);
    }

    private dayLabel_: string = '';
    public get dayLabel(): string {
        return this. dayLabel_;
    }
    public set dayLabel(v: string) {
        this. dayLabel_ = v;
    }

    private  estimateTime_: string = '';
    public get estimateTime(): string {
        return this. estimateTime_;
    }
    public set estimateTime(v: string) {
        this. estimateTime_ = v;
    }
}
