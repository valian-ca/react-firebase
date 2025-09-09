import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import { type ObservableQueryOptions, observableQueryOptions } from '@valian/react-query-observable'
import { fromQuery, querySnapshotState } from '@valian/rxjs-firebase'
import { of } from 'rxjs'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaFirestoreQueryFactory,
  type SchemaQuerySpecification,
} from 'zod-firebase'

import { type SchemaQuerySnapshotState, type SchemaQuerySnapshotStateListener } from '../rxjs/types'
import { sentrySchemaQuerySnapshotListener } from '../sentry/sentrySchemaQuerySnapshotListener'

import { type QueryFnFromQuerySnapshotSubjectFactoryOptions } from './querySnapshotQueryOptions'

export interface SchemaQuerySnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
      ObservableQueryOptions<SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError, TData, TQueryKey>,
      'observableFn'
    >,
    QueryFnFromQuerySnapshotSubjectFactoryOptions {
  factory: SchemaFirestoreQueryFactory<TCollectionSchema>
  query?: SchemaQuerySpecification<TCollectionSchema, TOptions> | null
  snapshotOptions?: TOptions & SnapshotListenOptions
  listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>
}

export const schemaQuerySnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>({
  factory,
  query,
  snapshotOptions,
  listener,
  ...props
}: SchemaQuerySnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>) =>
  observableQueryOptions<SchemaQuerySnapshotState<TCollectionSchema, TOptions>, TError, TData, TQueryKey>({
    observableFn: () =>
      !query
        ? of({
            empty: true,
            size: 0,
            isLoading: false,
            hasError: false,
            disabled: true,
            data: [],
          } as const satisfies SchemaQuerySnapshotState<TCollectionSchema, TOptions>)
        : fromQuery(factory.prepare(query, snapshotOptions), snapshotOptions).pipe(
            querySnapshotState(sentrySchemaQuerySnapshotListener(factory.collectionName, query, listener)),
          ),
    enabled: !!query,
    gcTime: 10_000,
    ...props,
    meta: {
      ...props.meta,
      type: 'snapshot',
      collection: factory.collectionName,
      schemaQuery: query,
    },
  })
