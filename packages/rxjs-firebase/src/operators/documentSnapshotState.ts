import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { catchError, map, type OperatorFunction, startWith, tap } from 'rxjs'

import { type DocumentSnapshotState } from '../states/DocumentSnapshotState'

import { documentSnapshotStateObservable } from './documentSnapshotStateObservable'

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
        documentSnapshotStateObservable<AppModelType, DbModelType>({
          isLoading: false,
          hasError: true,
          disabled: false,
        }),
      ),
      startWith({
        isLoading: true,
        hasError: false,
        disabled: false,
      } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>),
    )
