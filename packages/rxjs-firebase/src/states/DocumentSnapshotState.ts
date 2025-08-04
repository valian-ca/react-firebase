import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'

interface DocumentSnapshotLoadingState {
  snapshot?: undefined
  exists?: undefined
  isLoading: true
  hasError: false
  data?: undefined
}

interface DocumentSnapshotErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: DocumentSnapshot<AppModelType, DbModelType>
  exists?: boolean
  isLoading: false
  hasError: true
  data?: undefined
}

interface DocumentDoesNotExistState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: false
  isLoading: false
  hasError: false
  data?: undefined
}

interface DocumentSnapshotDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: true
  isLoading: false
  hasError: false
  data: AppModelType
}

export type DocumentSnapshotState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | DocumentSnapshotLoadingState
  | DocumentSnapshotErrorState<AppModelType, DbModelType>
  | DocumentDoesNotExistState<AppModelType, DbModelType>
  | DocumentSnapshotDataState<AppModelType, DbModelType>
