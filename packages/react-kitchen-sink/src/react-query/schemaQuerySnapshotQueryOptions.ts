import { type SnapshotListenOptions } from '@firebase/firestore'
import {
  type DataTag,
  type DefaultError,
  type QueryKey,
  queryOptions,
  type UnusedSkipTokenOptions,
} from '@tanstack/react-query'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaFirestoreQueryFactory,
  type SchemaQuerySpecification,
} from 'zod-firebase'

import { type SchemaQuerySnapshotState, type SchemaQuerySnapshotStateListener } from '../rxjs/types'

import {
  queryFnFromQuerySnapshotSubjectFactory,
  type QueryFnFromQuerySnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromQuerySnapshotSubjectFactory'
import { type FirestoreSnapshotManager } from './FirestoreSnapshotManager'

export interface SchemaQuerySnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UnusedSkipTokenOptions<SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError, TData, TQueryKey>,
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
  factory: SchemaFirestoreQueryFactory<TCollectionSchema>
  query?: SchemaQuerySpecification<TCollectionSchema, TOptions> | null
  snapshotOptions?: TOptions & SnapshotListenOptions
  listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>
}

export interface SchemaQuerySnapshotQueryOptionsResult<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> extends UnusedSkipTokenOptions<SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError, TData, TQueryKey> {
  queryKey: DataTag<TQueryKey, SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError>
}

export const schemaQuerySnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnapshotManager,
  {
    factory,
    query,
    snapshotOptions,
    listener,
    ...props
  }: SchemaQuerySnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>,
): SchemaQuerySnapshotQueryOptionsResult<TCollectionSchema, TOptions, TError, TData, TQueryKey> =>
  queryOptions({
    queryFn: query
      ? queryFnFromQuerySnapshotSubjectFactory(
          snapshotManager.schemaQuerySnapshotSubjectFactory(factory, query, snapshotOptions, listener),
          props,
        )
      : () =>
          Promise.resolve({
            empty: true,
            size: 0,
            data: [],
            isLoading: false,
            hasError: false,
            disabled: true,
          } as const),
    enabled: !!query,
    staleTime: () => (snapshotManager.isSnapshotAlive(props.queryKey) ? Infinity : 0),
    retry: false,
    gcTime: 10_000,
    ...props,
    meta: {
      ...props.meta,
      type: 'snapshot',
      snapshotManager,
      collection: factory.collectionName,
      schemaQuery: query,
    },
  })
