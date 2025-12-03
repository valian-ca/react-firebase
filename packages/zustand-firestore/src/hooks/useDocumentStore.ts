import { useMemo } from 'react'

import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import {
  type DocumentSnapshotDisabledState,
  documentSnapshotState,
  type DocumentSnapshotStateListener,
  fromDocumentRef,
  startWithDocumentSnapshotLoadingState,
} from '@valian/rxjs-firebase'
import { useObservable } from 'observable-hooks'
import { of, switchMap } from 'rxjs'

import { createDocumentSnapshotStore, useStoreSubscription } from '../store'

import { useSnapshotListenOptions } from './useSnapshotListenOptions'

export { type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'

export interface UseDocumentStoreOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>
  extends DocumentSnapshotStateListener<AppModelType, DbModelType>, SnapshotListenOptions {
  ref: DocumentReference<AppModelType, DbModelType> | null | undefined
}

export const useDocumentStore = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  options: UseDocumentStoreOptions<AppModelType, DbModelType>,
) => {
  const snapshotListenOptions = useSnapshotListenOptions(options)
  const snapshotState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([ref, snapshotOptions]) => {
          if (!ref) {
            return of({
              isLoading: false,
              hasError: false,
              disabled: true,
            } as const satisfies DocumentSnapshotDisabledState)
          }
          return fromDocumentRef(ref, snapshotOptions).pipe(
            documentSnapshotState(options),
            startWithDocumentSnapshotLoadingState<AppModelType, DbModelType>(),
          )
        }),
      ),
    [options.ref, snapshotListenOptions],
  )
  const store = useMemo(() => createDocumentSnapshotStore<AppModelType, DbModelType>(), [])
  useStoreSubscription(store, snapshotState$)
  return store
}
