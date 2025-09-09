import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'
import { finalize, identity, map, type OperatorFunction, tap } from 'rxjs'

import { type QuerySnapshotDataState, type QuerySnapshotErrorState } from '../states/QuerySnapshotState'

import { catchQuerySnapshotError } from './catchQuerySnapshotError'

export interface QuerySnapshotStateListener<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  onSnapshot?: (snapshot: QuerySnapshotDataState<AppModelType, DbModelType>) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const querySnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
  ): OperatorFunction<
    QuerySnapshot<AppModelType, DbModelType>,
    QuerySnapshotDataState<AppModelType, DbModelType> | QuerySnapshotErrorState
  > =>
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
          }) as const satisfies QuerySnapshotDataState<AppModelType, DbModelType>,
      ),
      tap({
        next: listener?.onSnapshot,
        error: listener?.onError,
      }),
      listener?.onComplete ? finalize(listener.onComplete) : identity,
      catchQuerySnapshotError<AppModelType, DbModelType>(),
    )
