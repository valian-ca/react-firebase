import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'

export interface DocumentSnapshotDisabledState {
  snapshot?: undefined
  exists?: undefined
  isLoading: false
  hasError: false
  disabled: true
  data?: undefined
}

export interface DocumentSnapshotLoadingState {
  snapshot?: undefined
  exists?: undefined
  isLoading: true
  hasError: false
  disabled: false
  data?: undefined
}

export interface DocumentSnapshotErrorState {
  snapshot?: undefined
  exists?: boolean
  isLoading: false
  hasError: true
  disabled: false
  data?: undefined
}

export interface DocumentDoesNotExistState<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  snapshot: DocumentSnapshot<AppModelType, DbModelType>
  exists: false
  isLoading: false
  hasError: false
  disabled: false
  data?: undefined
}

export interface DocumentSnapshotDataState<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
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
  | DocumentSnapshotErrorState
  | DocumentDoesNotExistState<AppModelType, DbModelType>
  | DocumentSnapshotDataState<AppModelType, DbModelType>
