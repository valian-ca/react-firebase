import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type QuerySpecification,
  type SchemaFirestoreQueryFactory,
} from 'zod-firebase'

import { type SchemaQuerySnapshotState, type SchemaQuerySnapshotStateListener } from '../rxjs/schemaTypes'

import {
  queryFnFromQuerySnapshotSubjectFactory,
  type QueryFnFromQuerySnapshotSubjectFactoryOptions,
} from './queryFn/queryFnFromQuerySnapshotSubjectFactory'
import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'

export interface SchemaQuerySnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      UseQueryOptions<SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError, TData, TQueryKey>,
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
  query: QuerySpecification
  snapshotOptions?: TOptions & SnapshotListenOptions
  listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>
}

export const schemaQuerySnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    factory,
    query,
    snapshotOptions,
    listener,
    ...props
  }: SchemaQuerySnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>,
) =>
  queryOptions({
    queryFn: queryFnFromQuerySnapshotSubjectFactory(
      snapshotManager.schemaQuerySnapshotSubjectFactory(factory, query, snapshotOptions, listener),
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
      collection: factory.collectionName,
      schemaQuery: query,
      ...props.meta,
    },
  })
