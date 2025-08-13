import { type DocumentData, type Query as FirestoreQuery, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefinedInitialDataOptions, type QueryKey, queryOptions } from '@tanstack/react-query'
import {
  fromQuery,
  type QuerySnapshotState,
  type QuerySnapshotStateListener,
  QuerySnapshotSubject,
} from '@valian/rxjs-firebase'
import { firstValueFrom, skipWhile, takeUntil, timer } from 'rxjs'

import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'
import { querySnapshotQueryClientObserver } from './querySnapshotQueryClientObserver'

export interface QuerySnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    DefinedInitialDataOptions<
      QuerySnapshotState<AppModelType, DbModelType>,
      Error,
      QuerySnapshotState<AppModelType, DbModelType>,
      TQueryKey
    >,
    'queryFn'
  > {
  query: FirestoreQuery<AppModelType, DbModelType>
  options?: SnapshotListenOptions
  listener?: QuerySnapshotStateListener<AppModelType, DbModelType>
  waitForData?: boolean
  waitForDataTimeout?: number
}

export const querySnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    query,
    options,
    listener,
    waitForData,
    waitForDataTimeout = 10_000,
    ...otherOptions
  }: QuerySnapshotQueryOptions<AppModelType, DbModelType, TQueryKey>,
) =>
  queryOptions<
    QuerySnapshotState<AppModelType, DbModelType>,
    Error,
    QuerySnapshotState<AppModelType, DbModelType>,
    TQueryKey
  >({
    queryFn: async ({ client, queryKey, signal }) => {
      const subject$ = new QuerySnapshotSubject(fromQuery<AppModelType, DbModelType>(query, options), listener)
      subject$.subscribe(querySnapshotQueryClientObserver<AppModelType, DbModelType>(client, queryKey))

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

      return {
        empty: true,
        size: 0,
        isLoading: true,
        hasError: false,
        disabled: false,
        data: [],
      } as const
    },
    staleTime: Infinity,
    ...otherOptions,
    meta: {
      type: 'snapshot',
      snapshotManager,
      query,
      ...otherOptions.meta,
    },
  })
