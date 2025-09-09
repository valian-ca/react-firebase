import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { defer, finalize, of, type OperatorFunction, Subject, switchMap, takeUntil } from 'rxjs'

import { fromDocumentRef } from '../source'
import { type DocumentSnapshotDisabledState, type DocumentSnapshotState } from '../states/DocumentSnapshotState'

import { documentSnapshotState, type DocumentSnapshotStateListener } from './documentSnapshotState'
import { startWithDocumentSnapshotLoadingState } from './startWithDocumentSnapshotLoadingState'

export const documentSnapshot =
  <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
    options?: SnapshotListenOptions,
  ): OperatorFunction<
    DocumentReference<AppModelType, DbModelType> | null | undefined,
    DocumentSnapshotState<AppModelType, DbModelType>
  > =>
  (source$) =>
    defer(() => {
      const closeSnapshot = new Subject<void>()
      return source$.pipe(
        finalize(() => {
          closeSnapshot.next()
          closeSnapshot.complete()
        }),
        switchMap((ref) => {
          if (!ref) {
            return of({
              isLoading: false,
              hasError: false,
              disabled: true,
            } as const satisfies DocumentSnapshotDisabledState)
          }
          return fromDocumentRef(ref, options).pipe(
            takeUntil(closeSnapshot),
            documentSnapshotState(listener),
            startWithDocumentSnapshotLoadingState<AppModelType, DbModelType>(),
          )
        }),
      )
    })
