import { type DocumentData, type Query, type SnapshotListenOptions } from '@firebase/firestore'
import { defer, of, type OperatorFunction, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs'

import { fromQuery } from '../source'
import { type QuerySnapshotState } from '../states/QuerySnapshotState'

import { querySnapshotState, type QuerySnapshotStateListener } from './querySnapshotState'

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
        tap({
          complete: () => {
            closeSnapshot.next()
            closeSnapshot.complete()
          },
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
            } as const satisfies QuerySnapshotState<AppModelType, DbModelType>)
          }
          return fromQuery(query, options).pipe(querySnapshotState(listener), takeUntil(closeSnapshot))
        }),
        startWith({
          empty: true,
          size: 0,
          isLoading: false,
          hasError: false,
          disabled: true,
          data: [],
        } as const satisfies QuerySnapshotState<AppModelType, DbModelType>),
      )
    })
