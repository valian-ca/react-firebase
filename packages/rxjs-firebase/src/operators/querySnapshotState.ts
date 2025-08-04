import { type DocumentData, type QuerySnapshot } from '@firebase/firestore'
import { catchError, type Observable, of, type OperatorFunction, startWith, tap } from 'rxjs'
import { map } from 'rxjs'

import { QuerySnapshotInitialState } from '../states/QuerySnapshotInitialState'
import { type QuerySnapshotState } from '../states/QuerySnapshotState'

export interface QueryStateOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  onSnapshot?: (snapshot: QuerySnapshotState<AppModelType, DbModelType>) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const querySnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    options?: QueryStateOptions<AppModelType, DbModelType>,
  ): OperatorFunction<QuerySnapshot<AppModelType, DbModelType>, QuerySnapshotState<AppModelType, DbModelType>> =>
  (source: Observable<QuerySnapshot<AppModelType, DbModelType>>) =>
    source.pipe(
      map(
        (snapshot) =>
          ({
            snapshot,
            size: snapshot.size,
            empty: snapshot.empty,
            isLoading: false,
            hasError: false,
            data: snapshot.docs.map((doc) => doc.data()),
          }) as const satisfies QuerySnapshotState<AppModelType, DbModelType>,
      ),
      tap({
        next: options?.onSnapshot,
        error: options?.onError,
        complete: options?.onComplete,
      }),
      catchError(() =>
        of({
          size: 0,
          empty: true,
          isLoading: false,
          hasError: true,
          data: [],
        } as const satisfies QuerySnapshotState<AppModelType, DbModelType>),
      ),
      startWith({ ...QuerySnapshotInitialState }),
    )
