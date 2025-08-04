import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { catchError, type Observable, of, type OperatorFunction, startWith, tap } from 'rxjs'
import { map } from 'rxjs'

import { DocumentSnapshotInitialState } from '../states/DocumentSnapshotInitialState'
import { type DocumentSnapshotState } from '../states/DocumentSnapshotState'

export interface DocumentStateOptions<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
  onSnapshot?: (snapshot: DocumentSnapshotState<AppModelType, DbModelType>) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const documentSnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    options?: DocumentStateOptions<AppModelType, DbModelType>,
  ): OperatorFunction<DocumentSnapshot<AppModelType, DbModelType>, DocumentSnapshotState<AppModelType, DbModelType>> =>
  (source: Observable<DocumentSnapshot<AppModelType, DbModelType>>) =>
    source.pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return {
            snapshot,
            exists: true,
            isLoading: false,
            hasError: false,
            data: snapshot.data(),
          } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>
        }
        return {
          snapshot,
          exists: false,
          isLoading: false,
          hasError: false,
        } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>
      }),
      tap({
        next: options?.onSnapshot,
        error: options?.onError,
        complete: options?.onComplete,
      }),
      catchError(() =>
        of({
          isLoading: false,
          hasError: true,
        } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>),
      ),
      startWith({ ...DocumentSnapshotInitialState }),
    )
