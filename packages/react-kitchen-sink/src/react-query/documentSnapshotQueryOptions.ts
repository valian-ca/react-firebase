import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefinedInitialDataOptions, type QueryKey, queryOptions } from '@tanstack/react-query'
import { type DocumentSnapshotState, type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'
import { firstValueFrom, skipWhile, takeUntil, timer } from 'rxjs'

import { documentSnapshotSubject } from '../rxjs/documentSnapshotSubject'

import { documentSnapshotQueryClientObserver } from './documentSnapshotQueryClientObserver'
import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'

export interface DocumentSnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    DefinedInitialDataOptions<
      DocumentSnapshotState<AppModelType, DbModelType>,
      Error,
      DocumentSnapshotState<AppModelType, DbModelType>,
      TQueryKey
    >,
    'queryFn'
  > {
  ref: DocumentReference<AppModelType, DbModelType>
  options?: SnapshotListenOptions
  listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>
  waitForData?: boolean
  waitForDataTimeout?: number
}

export const documentSnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    ref,
    options,
    listener,
    waitForData,
    waitForDataTimeout = 10_000,
    ...otherOptions
  }: DocumentSnapshotQueryOptions<AppModelType, DbModelType, TQueryKey>,
) =>
  queryOptions<
    DocumentSnapshotState<AppModelType, DbModelType>,
    Error,
    DocumentSnapshotState<AppModelType, DbModelType>,
    TQueryKey
  >({
    queryFn: async ({ client, queryKey, signal }) => {
      const subject$ = documentSnapshotSubject(ref, options, listener)
      subject$.subscribe(documentSnapshotQueryClientObserver<AppModelType, DbModelType>(client, queryKey))

      signal.addEventListener('abort', () => {
        subject$.close()
      })

      snapshotManager.registerSnapshotOnClose(queryKey, () => {
        subject$.close()
      })

      if (waitForData) {
        return firstValueFrom(
          subject$.pipe(
            takeUntil(timer(waitForDataTimeout)),
            skipWhile(({ isLoading }) => isLoading),
          ),
        )
      }

      return { isLoading: true, hasError: false, disabled: false } as const
    },
    staleTime: Infinity,
    ...otherOptions,
    meta: {
      type: 'snapshot',
      snapshotManager,
      documentRef: ref,
      ...otherOptions.meta,
    },
  })
