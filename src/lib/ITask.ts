import { firestore } from 'firebase'

export default interface ITask {
  id: string
  date: firestore.Timestamp
  title: string
  isDoing: boolean
  startTime: firestore.Timestamp | null
  endTime: firestore.Timestamp | null
  actualTime: number
  estimateTime: number
  repeatId: string
  sortNo: number
  isDeleted: boolean
  createTime: firestore.Timestamp
  updateTime: firestore.Timestamp
}
