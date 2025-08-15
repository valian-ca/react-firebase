import { type DocumentData, type Query as FirestoreQuery, type SnapshotListenOptions } from '@firebase/firestore'
import {
  type DataTag,
  type DefaultError,
  type QueryKey,
  queryOptions,
  type UnusedSkipTokenOptions,
} from '@tanstack/react-query'
import { type QuerySnapshotState, type QuerySnapshotStateListener } from '@valian/rxjs-firebase'

import {
  queryFnFromQuerySnapshotSubjectFactory,
  type QueryFnFromQuerySnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromQuerySnapshotSubjectFactory'
import { type FirestoreSnapshotManager } from './FirestoreSnapshotManager'

export interface QuerySnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UnusedSkipTokenOptions<QuerySnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
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

export interface QuerySnapshotQueryOptionsResult<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends UnusedSkipTokenOptions<QuerySnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey> {
  queryKey: DataTag<TQueryKey, QuerySnapshotState<AppModelType, DbModelType>, TError>
}

export const querySnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnapshotManager,
  {
    query,
    snapshotOptions,
    listener,
    ...props
  }: QuerySnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>,
): QuerySnapshotQueryOptionsResult<AppModelType, DbModelType, TError, TData, TQueryKey> =>
  queryOptions({
    queryFn: queryFnFromQuerySnapshotSubjectFactory(
      snapshotManager.querySnapshotSubjectFactory(query, snapshotOptions, listener),
      props,
    ),
    staleTime: Infinity,
    retry: false,
    gcTime: 10_000,
    initialData: undefined,
    ...props,
    meta: {
      type: 'snapshot',
      snapshotManager,
      query,
      ...props.meta,
    },
  })
