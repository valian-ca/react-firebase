import { type DocumentData, type Query as FirestoreQuery, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import { type QuerySnapshotState, type QuerySnapshotStateListener } from '@valian/rxjs-firebase'

import {
  queryFnFromQuerySnapshotSubjectFactory,
  type QueryFnFromQuerySnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromQuerySnapshotSubjectFactory'
import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'

export interface QuerySnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UseQueryOptions<QuerySnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
      | 'queryFn'
      | 'initialData'
      | 'staleTime'
      | 'refetchInterval'
      | 'refetchIntervalInBackground'
      | 'refetchOnWindowFocus'
      | 'refetchOnMount'
      | 'refetchOnReconnect'
      | 'retryOnMount'
      | 'retry'
    >,
    QueryFnFromQuerySnapshotSubjectFactoryOptions {
  query: FirestoreQuery<AppModelType, DbModelType>
  snapshotOptions?: SnapshotListenOptions
  listener?: QuerySnapshotStateListener<AppModelType, DbModelType>
}

export const querySnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    query,
    snapshotOptions,
    listener,
    ...props
  }: QuerySnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>,
) =>
  queryOptions({
    queryFn: queryFnFromQuerySnapshotSubjectFactory(
      snapshotManager.querySnapshotSubjectFactory(query, snapshotOptions, listener),
      props,
    ),
    staleTime: Infinity,
    retry: false,
    gcTime: 10_000,
    initialData: {
      empty: true,
      size: 0,
      isLoading: true,
      hasError: false,
      disabled: false,
      data: [],
    },
    ...props,
    meta: {
      type: 'snapshot',
      snapshotManager,
      query,
      ...props.meta,
    },
  })
