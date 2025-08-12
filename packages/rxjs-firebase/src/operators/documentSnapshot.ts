import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { of, type OperatorFunction, startWith, switchMap } from 'rxjs'

import { fromDocumentRef } from '../source'
import { type DocumentSnapshotState } from '../states/DocumentSnapshotState'

import { documentSnapshotState, type DocumentSnapshotStateListener } from './documentSnapshotState'

export const documentSnapshot =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
    options?: SnapshotListenOptions,
  ): OperatorFunction<
    DocumentReference<AppModelType, DbModelType> | null | undefined,
    DocumentSnapshotState<AppModelType, DbModelType>
  > =>
  (source$) =>
    source$.pipe(
      switchMap((ref) => {
        if (!ref) {
          return of({ isLoading: false, hasError: false, disabled: true } as const satisfies DocumentSnapshotState<
            AppModelType,
            DbModelType
          >)
        }
        return fromDocumentRef(ref, options).pipe(documentSnapshotState(listener))
      }),
      startWith({ isLoading: false, hasError: false, disabled: true } as const satisfies DocumentSnapshotState<
        AppModelType,
        DbModelType
      >),
    )
