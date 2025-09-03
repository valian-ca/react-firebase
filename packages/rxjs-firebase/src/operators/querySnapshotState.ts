import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'
import { catchError, map, type OperatorFunction, startWith, tap } from 'rxjs'

import { type QuerySnapshotState } from '../states/QuerySnapshotState'

import { querySnapshotStateObservable } from './querySnapshotStateObservable'

export interface QuerySnapshotStateListener<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  onSnapshot?: (snapshot: QuerySnapshotState<AppModelType, DbModelType>) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const querySnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
  ): OperatorFunction<QuerySnapshot<AppModelType, DbModelType>, QuerySnapshotState<AppModelType, DbModelType>> =>
  (source$) =>
    source$.pipe(
      map(
        (snapshot) =>
          ({
            snapshot,
            size: snapshot.size,
            empty: snapshot.empty,
            isLoading: false,
            hasError: false,
            disabled: false,
            data: snapshot.docs.map((doc) => doc.data()),
          }) as const satisfies QuerySnapshotState<AppModelType, DbModelType>,
      ),
      tap({
        next: listener?.onSnapshot,
        error: listener?.onError,
        complete: listener?.onComplete,
      }),
      catchError(() =>
        querySnapshotStateObservable<AppModelType, DbModelType>({
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          disabled: false,
          data: [],
        }),
      ),
      startWith({
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      } as const satisfies QuerySnapshotState<AppModelType, DbModelType>),
    )
