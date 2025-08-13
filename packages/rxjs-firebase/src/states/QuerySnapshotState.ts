import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'

interface QuerySnapshotDisabledState {
  snapshot?: undefined
  empty: true
  size: 0
  isLoading: false
  hasError: false
  disabled: true
  data: []
}

interface QuerySnapshotLoadingState {
  snapshot?: undefined
  empty: true
  size: 0
  isLoading: true
  hasError: false
  disabled: false
  data: []
}

interface QuerySnapshotErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  hasError: true
  disabled: false
  data: []
}

interface QuerySnapshotDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: QuerySnapshot<AppModelType, DbModelType>
  empty: boolean
  size: number
  isLoading: false
  hasError: false
  disabled: false
  data: AppModelType[]
}

export type QuerySnapshotState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | QuerySnapshotDisabledState
  | QuerySnapshotLoadingState
  | QuerySnapshotErrorState<AppModelType, DbModelType>
  | QuerySnapshotDataState<AppModelType, DbModelType>
