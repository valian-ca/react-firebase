import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'

interface DocumentSnapshotDisabledState {
  snapshot?: undefined
  exists?: undefined
  isLoading: false
  hasError: false
  disabled: true
  data?: undefined
}

interface DocumentSnapshotLoadingState {
  snapshot?: undefined
  exists?: undefined
  isLoading: true
  hasError: false
  disabled: false
  data?: undefined
}

interface DocumentSnapshotErrorState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot?: DocumentSnapshot<AppModelType, DbModelType>
  exists?: boolean
  isLoading: false
  hasError: true
  disabled: false
  data?: undefined
}

interface DocumentDoesNotExistState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: false
  isLoading: false
  hasError: false
  disabled: false
  data?: undefined
}

interface DocumentSnapshotDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: true
  isLoading: false
  hasError: false
  disabled: false
  data: AppModelType
}

export type DocumentSnapshotState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | DocumentSnapshotDisabledState
  | DocumentSnapshotLoadingState
  | DocumentSnapshotErrorState<AppModelType, DbModelType>
  | DocumentDoesNotExistState<AppModelType, DbModelType>
  | DocumentSnapshotDataState<AppModelType, DbModelType>
