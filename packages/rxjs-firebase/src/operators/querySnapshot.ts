import { type DocumentData, type Query, type SnapshotListenOptions } from '@firebase/firestore'
import { defer, finalize, of, type OperatorFunction, Subject, switchMap, takeUntil } from 'rxjs'

import { fromQuery } from '../source'
import { type QuerySnapshotDisabledState, type QuerySnapshotState } from '../states/QuerySnapshotState'

import { querySnapshotState, type QuerySnapshotStateListener } from './querySnapshotState'
import { startWithQuerySnapshotLoadingState } from './startWithQuerySnapshotLoadingState'

export const querySnapshot =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
    options?: SnapshotListenOptions,
  ): OperatorFunction<
    Query<AppModelType, DbModelType> | null | undefined,
    QuerySnapshotState<AppModelType, DbModelType>
  > =>
  (source$) =>
    defer(() => {
      const closeSnapshot = new Subject<void>()
      return source$.pipe(
        finalize(() => {
          closeSnapshot.next()
          closeSnapshot.complete()
        }),
        switchMap((query) => {
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
          return fromQuery(query, options).pipe(
            takeUntil(closeSnapshot),
            querySnapshotState(listener),
            startWithQuerySnapshotLoadingState<AppModelType, DbModelType>(),
          )
        }),
      )
    })
