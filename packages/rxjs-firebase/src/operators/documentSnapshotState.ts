import { type DocumentData, type DocumentSnapshot } from '@firebase/firestore'
import { finalize, identity, map, type OperatorFunction, tap } from 'rxjs'

import {
  type DocumentDoesNotExistState,
  type DocumentSnapshotDataState,
  type DocumentSnapshotErrorState,
} from '../states/DocumentSnapshotState'

import { catchDocumentSnapshotError } from './catchDocumentSnapshotError'

export interface DocumentSnapshotStateListener<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  onSnapshot?: (
    snapshot:
      | DocumentSnapshotDataState<AppModelType, DbModelType>
      | DocumentDoesNotExistState<AppModelType, DbModelType>,
  ) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export const documentSnapshotState =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
  ): OperatorFunction<
    DocumentSnapshot<AppModelType, DbModelType>,
    | DocumentSnapshotDataState<AppModelType, DbModelType>
    | DocumentDoesNotExistState<AppModelType, DbModelType>
    | DocumentSnapshotErrorState
  > =>
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
          } as const satisfies DocumentSnapshotDataState<AppModelType, DbModelType>
        }
        return {
          snapshot,
          exists: false,
          isLoading: false,
          hasError: false,
          disabled: false,
        } as const satisfies DocumentDoesNotExistState<AppModelType, DbModelType>
      }),
      tap({
        next: listener?.onSnapshot,
        error: listener?.onError,
      }),
      listener?.onComplete ? finalize(listener.onComplete) : identity,
      catchDocumentSnapshotError<AppModelType, DbModelType>(),
    )
