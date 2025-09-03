import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { defer, of, type OperatorFunction, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs'

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
    defer(() => {
      const closeSnapshot = new Subject<void>()
      return source$.pipe(
        tap({
          complete: () => {
            closeSnapshot.next()
            closeSnapshot.complete()
          },
        }),
        switchMap((ref) => {
          if (!ref) {
            return of({
              isLoading: false,
              hasError: false,
              disabled: true,
            } as const satisfies DocumentSnapshotState<AppModelType, DbModelType>)
          }
          return fromDocumentRef(ref, options).pipe(documentSnapshotState(listener), takeUntil(closeSnapshot))
        }),
        startWith({ isLoading: false, hasError: false, disabled: true } as const satisfies DocumentSnapshotState<
          AppModelType,
          DbModelType
        >),
      )
    })
