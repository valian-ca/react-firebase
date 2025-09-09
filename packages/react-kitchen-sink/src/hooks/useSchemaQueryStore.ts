import { useMemo } from 'react'

import { type SnapshotListenOptions } from '@firebase/firestore'
import {
  fromQuery,
  type QuerySnapshotDisabledState,
  querySnapshotState,
  startWithQuerySnapshotLoadingState,
} from '@valian/rxjs-firebase'
import { createQuerySnapshotStore, useSnapshotListenOptions, useStoreSubscription } from '@valian/zustand-firestore'
import { useObservable } from 'observable-hooks'
import { of, switchMap } from 'rxjs'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreQueryFactory,
  type SchemaQuerySpecification,
} from 'zod-firebase'
import { type StoreApi } from 'zustand'

import { type SchemaQuerySnapshotState, type SchemaQuerySnapshotStateListener } from '../rxjs/types'
import { sentrySchemaQuerySnapshotListener } from '../sentry/sentrySchemaQuerySnapshotListener'

export interface UseSchemaQueryStoreOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> extends SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>,
    SnapshotListenOptions {
  factory: SchemaFirestoreQueryFactory<TCollectionSchema>
  query: SchemaQuerySpecification<TCollectionSchema, TOptions> | null | undefined
  metaOptions?: TOptions
}

export type SchemaQueryStoreApi<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> = StoreApi<SchemaQuerySnapshotState<TCollectionSchema, TOptions>>

export const useSchemaQueryStore = <TCollectionSchema extends CollectionSchema, TOptions extends MetaOutputOptions>({
  factory,
  metaOptions,
  ...options
}: UseSchemaQueryStoreOptions<TCollectionSchema, TOptions>): SchemaQueryStoreApi<TCollectionSchema, TOptions> => {
  const snapshotListenOptions = useSnapshotListenOptions(options)
  const snapshotState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([query, snapshotOptions]) => {
          if (!query) {
            return of({
              empty: true,
              size: 0,
              isLoading: false,
              hasError: false,
              disabled: true,
              data: [],
            } as const satisfies QuerySnapshotDisabledState)
          }
          const firestoreQuery = factory.prepare(query, metaOptions)
          return fromQuery(firestoreQuery, snapshotOptions).pipe(
            querySnapshotState(sentrySchemaQuerySnapshotListener(factory.collectionName, query, options)),
            startWithQuerySnapshotLoadingState<
              SchemaDocumentOutput<TCollectionSchema, TOptions>,
              SchemaDocumentInput<TCollectionSchema>
            >(),
          )
        }),
      ),
    [options.query, snapshotListenOptions],
  )
  const store = useMemo(
    () =>
      createQuerySnapshotStore<
        SchemaDocumentOutput<TCollectionSchema, TOptions>,
        SchemaDocumentInput<TCollectionSchema>
      >(),
    [],
  )
  useStoreSubscription(store, snapshotState$)
  return store
}
