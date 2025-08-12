import { type DocumentData } from '@firebase/firestore'
import { type QuerySnapshotState } from '@valian/rxjs-firebase'
import { createStore } from 'zustand'

export { type QuerySnapshotState } from '@valian/rxjs-firebase'

export const createQuerySnapshotStore = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>() =>
  createStore<QuerySnapshotState<AppModelType, DbModelType>>(() => ({
    empty: true,
    size: 0,
    isLoading: false,
    hasError: false,
    disabled: true,
    data: [],
  }))
