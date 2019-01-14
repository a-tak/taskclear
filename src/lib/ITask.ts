import { firestore } from 'firebase';

export default interface ITask {
    id: string;
    date: firestore.Timestamp;
    title: string;
    isDoing: boolean;
    startTime: firestore.Timestamp | undefined;
    endTime: firestore.Timestamp | undefined;
    actualTime: number;
    estimateTime: number;
    repeatId: string;
    sortNo: number;
    isDeleted: boolean;
    createTime: firestore.Timestamp;
    updateTime: firestore.Timestamp;
}
