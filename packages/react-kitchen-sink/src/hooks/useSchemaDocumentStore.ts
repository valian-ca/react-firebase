import { useMemo } from 'react'

import { type SnapshotListenOptions } from '@firebase/firestore'
import { documentSnapshotState, fromDocumentRef } from '@valian/rxjs-firebase'
import { createDocumentSnapshotStore, useSnapshotListenOptions, useStoreSubscription } from '@valian/zustand-firestore'
import { useObservable } from 'observable-hooks'
import { of, switchMap } from 'rxjs'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
} from 'zod-firebase'
import { type StoreApi } from 'zustand'

import { type SchemaDocumentSnapshotState, type SchemaDocumentSnapshotStateListener } from '../rxjs/schemaTypes'
import { sentryDocumentSnapshotListener } from '../sentry/sentryDocumentSnapshotListener'

export interface UseSchemaDocumentStoreOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> extends SchemaDocumentSnapshotStateListener<TCollectionSchema, TOptions>,
    SnapshotListenOptions {
  factory: SchemaFirestoreFactory<TCollectionSchema>
  id: string | null | undefined
  metaOptions?: TOptions
}

export type SchemaDocumentStoreApi<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> = StoreApi<SchemaDocumentSnapshotState<TCollectionSchema, TOptions>>

export const useSchemaDocumentStore = <TCollectionSchema extends CollectionSchema, TOptions extends MetaOutputOptions>({
  factory,
  metaOptions,
  ...options
}: UseSchemaDocumentStoreOptions<TCollectionSchema, TOptions>): SchemaDocumentStoreApi<TCollectionSchema, TOptions> => {
  const snapshotListenOptions = useSnapshotListenOptions(options)
  const snapshotState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([id, snapshotOptions]) => {
          if (!id) {
            return of({ isLoading: false, hasError: false, disabled: true } as const)
          }
          const ref = factory.read.doc(id, metaOptions)
          return fromDocumentRef(ref, snapshotOptions).pipe(
            documentSnapshotState(sentryDocumentSnapshotListener(ref, options)),
          )
        }),
      ),
    [options.id, snapshotListenOptions],
  )
  const store = useMemo(
    () =>
      createDocumentSnapshotStore<
        SchemaDocumentOutput<TCollectionSchema, TOptions>,
        SchemaDocumentInput<TCollectionSchema>
      >(),
    [],
  )
  useStoreSubscription(store, snapshotState$)
  return store
}
