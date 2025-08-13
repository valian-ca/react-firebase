import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { catchError, map, of, type OperatorFunction, startWith, tap } from 'rxjs'

import { type DocumentSnapshotState } from '../states/DocumentSnapshotState'

export interface DocumentSnapshotStateListener<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  onSnapshot?: (snapshot: DocumentSnapshotState<AppModelType, DbModelType>) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const documentSnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
  ): OperatorFunction<DocumentSnapshot<AppModelType, DbModelType>, DocumentSnapshotState<AppModelType, DbModelType>> =>
  (source$) =>
    source$.pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return {
            snapshot,
            exists: true,
            isLoading: false,
            hasError: false,
            disabled: false,
            data: snapshot.data(),
          } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>
        }
        return {
          snapshot,
          exists: false,
          isLoading: false,
          hasError: false,
          disabled: false,
        } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>
      }),
      tap({
        next: listener?.onSnapshot,
        error: listener?.onError,
        complete: listener?.onComplete,
      }),
      catchError(() =>
        of({
          isLoading: false,
          hasError: true,
          disabled: false,
        } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>),
      ),
      startWith({
        isLoading: true,
        hasError: false,
        disabled: false,
      } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>),
    )
