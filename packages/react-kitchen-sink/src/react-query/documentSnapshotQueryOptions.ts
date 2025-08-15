import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import {
  type DataTag,
  type DefaultError,
  type QueryKey,
  queryOptions,
  type UnusedSkipTokenOptions,
} from '@tanstack/react-query'
import { type DocumentSnapshotState, type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'

import {
  queryFnFromDocumentSnapshotSubjectFactory,
  type QueryFnFromDocumentSnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromDocumentSnapshotSubjectFactory'
import { type FirestoreSnapshotManager } from './FirestoreSnapshotManager'

export interface DocumentSnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UnusedSkipTokenOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
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
    QueryFnFromDocumentSnapshotSubjectFactoryOptions {
  ref: DocumentReference<AppModelType, DbModelType>
  snapshotOptions?: SnapshotListenOptions
  listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>
}

export interface DocumentSnapshotQueryOptionsResult<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends UnusedSkipTokenOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey> {
  queryKey: DataTag<TQueryKey, DocumentSnapshotState<AppModelType, DbModelType>, TError>
}

export const documentSnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnapshotManager,
  {
    ref,
    snapshotOptions,
    listener,
    ...props
  }: DocumentSnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>,
): DocumentSnapshotQueryOptionsResult<AppModelType, DbModelType, TError, TData, TQueryKey> =>
  queryOptions({
    queryFn: queryFnFromDocumentSnapshotSubjectFactory(
      snapshotManager.documentSnapshotSubjectFactory(ref, snapshotOptions, listener),
      props,
    ),
    staleTime: Infinity,
    retry: false,
    gcTime: 10_000,
    ...props,
    meta: {
      type: 'snapshot',
      snapshotManager,
      documentRef: ref,
      ...props.meta,
    },
  })
