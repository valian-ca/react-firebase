import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'

interface QuerySnapshotLoadingState {
  snapshot?: undefined
  empty: true
  size: 0
  isLoading: true
  hasError: false
  data: []
}

interface QuerySnapshotErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  hasError: true
  data: []
}

interface QuerySnapshotDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  hasError: false
  data: AppModelType[]
}

export type QuerySnapshotState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | QuerySnapshotLoadingState
  | QuerySnapshotErrorState<AppModelType, DbModelType>
  | QuerySnapshotDataState<AppModelType, DbModelType>
