import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import { type DocumentSnapshotState, type DocumentSnapshotStateListener } from '@valian/rxjs-firebase'

import {
  queryFnFromDocumentSnapshotSubjectFactory,
  type QueryFnFromDocumentSnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromDocumentSnapshotSubjectFactory'
import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'

export interface DocumentSnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UseQueryOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
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

export const documentSnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    ref,
    snapshotOptions,
    listener,
    ...props
  }: DocumentSnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>,
) =>
  queryOptions({
    queryFn: queryFnFromDocumentSnapshotSubjectFactory(
      snapshotManager.documentSnapshotSubjectFactory(ref, snapshotOptions, listener),
      props,
    ),
    staleTime: Infinity,
    retry: false,
    gcTime: 10_000,
    initialData: {
      isLoading: true,
      hasError: false,
      disabled: false,
    },
    ...props,
    meta: {
      type: 'snapshot',
      snapshotManager,
      documentRef: ref,
      ...props.meta,
    },
  })
