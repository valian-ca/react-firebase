import { useMemo } from 'react'

import { type DocumentData, type Query, type SnapshotListenOptions } from '@firebase/firestore'
import {
  fromQuery,
  type QuerySnapshotDisabledState,
  querySnapshotState,
  type QuerySnapshotStateListener,
  startWithQuerySnapshotLoadingState,
} from '@valian/rxjs-firebase'
import { useObservable } from 'observable-hooks'
import { of, switchMap } from 'rxjs'

import { createQuerySnapshotStore, useStoreSubscription } from '../store'

import { useSnapshotListenOptions } from './useSnapshotListenOptions'

export { type QuerySnapshotStateListener } from '@valian/rxjs-firebase'

export interface UseQueryStoreOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>
  extends QuerySnapshotStateListener<AppModelType, DbModelType>, SnapshotListenOptions {
  query: Query<AppModelType, DbModelType> | null | undefined
}

export const useQueryStore = <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  options: UseQueryStoreOptions<AppModelType, DbModelType>,
) => {
  const snapshotListenOptions = useSnapshotListenOptions(options)
  const snapshotState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([query, snapshotOptions]) => {
          if (!query) {
            return of({
              empty: true,
              size: 0,
              isLoading: false,
              hasError: false,
              disabled: true,
              data: [],
            } as const satisfies QuerySnapshotDisabledState)
          }
          return fromQuery(query, snapshotOptions).pipe(
            querySnapshotState(options),
            startWithQuerySnapshotLoadingState<AppModelType, DbModelType>(),
          )
        }),
      ),
    [options.query, snapshotListenOptions],
  )
  const store = useMemo(() => createQuerySnapshotStore<AppModelType, DbModelType>(), [])
  useStoreSubscription(store, snapshotState$)
  return store
}
