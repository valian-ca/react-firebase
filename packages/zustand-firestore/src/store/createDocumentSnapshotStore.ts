import { type DocumentData } from '@firebase/firestore'
import { type DocumentSnapshotState } from '@valian/rxjs-firebase'
import { createStore } from 'zustand'

export { type DocumentSnapshotState } from '@valian/rxjs-firebase'

export const createDocumentSnapshotStore = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>() =>
  createStore<DocumentSnapshotState<AppModelType, DbModelType>>(() => ({
    isLoading: false,
    hasError: false,
    disabled: true,
  }))
