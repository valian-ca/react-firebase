import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'

export interface QuerySnapshotDisabledState {
  readonly snapshot?: undefined
  readonly empty: true
  readonly size: 0
  readonly isLoading: false
  readonly hasError: false
  readonly disabled: true
  readonly data: []
}

export interface QuerySnapshotLoadingState {
  readonly snapshot?: undefined
  readonly empty: true
  readonly size: 0
  readonly isLoading: true
  readonly hasError: false
  readonly disabled: false
  readonly data: []
}

export interface QuerySnapshotErrorState {
  readonly snapshot?: undefined
  readonly empty: boolean
  readonly size: number
  readonly isLoading: false
  readonly hasError: true
  readonly disabled: false
  readonly data: []
}

export interface QuerySnapshotDataState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  readonly snapshot: QuerySnapshot<AppModelType, DbModelType>
  readonly empty: boolean
  readonly size: number
  readonly isLoading: false
  readonly hasError: false
  readonly disabled: false
  readonly data: AppModelType[]
}

export type QuerySnapshotState<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | QuerySnapshotDisabledState
  | QuerySnapshotLoadingState
  | QuerySnapshotErrorState
  | QuerySnapshotDataState<AppModelType, DbModelType>
