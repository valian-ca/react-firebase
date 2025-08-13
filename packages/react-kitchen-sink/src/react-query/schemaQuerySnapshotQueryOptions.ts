import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefinedInitialDataOptions, type QueryKey, queryOptions } from '@tanstack/react-query'
import { firstValueFrom, skipWhile, takeUntil, timer } from 'rxjs'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type QuerySpecification,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreQueryFactory,
} from 'zod-firebase'

import { schemaQuerySnapshotSubject } from '../rxjs/schemaQuerySnapshotSubject'
import { type SchemaQuerySnapshotState, type SchemaQuerySnapshotStateListener } from '../rxjs/schemaTypes'

import { type FirestoreSnaphotManager } from './FirestoreSnaphotManager'
import { querySnapshotQueryClientObserver } from './querySnapshotQueryClientObserver'

export interface SchemaQuerySnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    DefinedInitialDataOptions<
      SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
      Error,
      SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
      TQueryKey
    >,
    'queryFn'
  > {
  factory: SchemaFirestoreQueryFactory<TCollectionSchema>
  query: QuerySpecification
  options?: TOptions & SnapshotListenOptions
  listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>
  waitForData?: boolean
  waitForDataTimeout?: number
}

export const schemaQuerySnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnaphotManager,
  {
    factory,
    query,
    options,
    listener,
    waitForData,
    waitForDataTimeout = 10_000,
    ...otherOptions
  }: SchemaQuerySnapshotQueryOptions<TCollectionSchema, TOptions, TQueryKey>,
) =>
  queryOptions<
    SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
    Error,
    SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
    TQueryKey
  >({
    queryFn: async ({ client, queryKey, signal }) => {
      const subject$ = schemaQuerySnapshotSubject<TCollectionSchema, TOptions>(factory, query, options, listener)
      subject$.subscribe(
        querySnapshotQueryClientObserver<
          SchemaDocumentOutput<TCollectionSchema, TOptions>,
          SchemaDocumentInput<TCollectionSchema>
        >(client, queryKey),
      )

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
      collection: factory.collectionName,
      schemaQuery: query,
      ...otherOptions.meta,
    },
  })
