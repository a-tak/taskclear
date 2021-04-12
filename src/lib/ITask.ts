import firebase from "firebase/app"

export default interface ITask {
  id: string
  date: firebase.firestore.Timestamp
  title: string
  isDoing: boolean
  startTime: firebase.firestore.Timestamp | null
  endTime: firebase.firestore.Timestamp | null
  actualTime: number
  estimateTime: number
  repeatId: string
  sortNo: number
  isDeleted: boolean
  estimateSeparateStart: boolean
  estimateSeparateEnd: boolean
  createTime: firebase.firestore.Timestamp
  updateTime: firebase.firestore.Timestamp
  note: string
}
