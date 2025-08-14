import {
  type DocumentData,
  type DocumentReference,
  type Query as FirestoreQuery,
  type SnapshotListenOptions,
} from '@firebase/firestore'
import {
  hashKey,
  type Query as TanstackQuery,
  type QueryCacheNotifyEvent,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import {
  type DocumentSnapshotStateListener,
  fromQuery,
  type QuerySnapshotStateListener,
  QuerySnapshotSubject,
} from '@valian/rxjs-firebase'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type QuerySpecification,
  type SchemaFirestoreFactory,
  type SchemaFirestoreQueryFactory,
} from 'zod-firebase'

import {
  documentSnapshotSubject,
  type SchemaDocumentSnapshotStateListener,
  type SchemaQuerySnapshotStateListener,
  schemaQuerySnapshotSubject,
} from '../rxjs'
import { schemaDocumentSnapshotSubject } from '../rxjs/schemaDocumentSnapshotSubject'

export class FirestoreSnaphotManager {
  readonly #onClose = new Map<string, () => void>()

  constructor(queryClient: QueryClient) {
    queryClient.getQueryCache().subscribe((event: QueryCacheNotifyEvent) => {
      if (event.type === 'removed' && event.query.meta?.type === 'snapshot') {
        const query = event.query as TanstackQuery
        const snapshotId = hashKey(query.queryKey)

        const closeSnapshot = this.#onClose.get(snapshotId)
        if (!closeSnapshot) {
          throw new Error(`Subscription for key ${snapshotId} not found`)
        }

        closeSnapshot()
        this.#onClose.delete(snapshotId)
      }
    })
  }

  registerSnapshotOnClose = (queryKey: QueryKey, onCloseSnapshot: () => void) => {
    const snapshotId = hashKey(queryKey)
    const closeSnapshot = this.#onClose.get(snapshotId)
    closeSnapshot?.()
    this.#onClose.set(snapshotId, onCloseSnapshot)
  }

  documentSnapshotSubjectFactory =
    <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
      ref: DocumentReference<AppModelType, DbModelType>,
      options?: SnapshotListenOptions,
      listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>,
    ) =>
    (queryKey: QueryKey) => {
      const subject$ = documentSnapshotSubject(ref, options, listener)
      this.registerSnapshotOnClose(queryKey, () => {
        subject$.close()
      })
      return subject$
    }

  schemaDocumentSnapshotSubjectFactory =
    <TCollectionSchema extends CollectionSchema, TOptions extends MetaOutputOptions>(
      factory: SchemaFirestoreFactory<TCollectionSchema>,
      id: string,
      options?: TOptions & SnapshotListenOptions,
      listener?: SchemaDocumentSnapshotStateListener<TCollectionSchema, TOptions>,
    ) =>
    (queryKey: QueryKey) => {
      const subject$ = schemaDocumentSnapshotSubject(factory, id, options, listener)
      this.registerSnapshotOnClose(queryKey, () => {
        subject$.close()
      })
      return subject$
    }

  querySnapshotSubjectFactory =
    <AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
      query: FirestoreQuery<AppModelType, DbModelType>,
      options?: SnapshotListenOptions,
      listener?: QuerySnapshotStateListener<AppModelType, DbModelType>,
    ) =>
    (queryKey: QueryKey) => {
      const subject$ = new QuerySnapshotSubject<AppModelType, DbModelType>(
        fromQuery<AppModelType, DbModelType>(query, options),
        listener,
      )
      this.registerSnapshotOnClose(queryKey, () => {
        subject$.close()
      })
      return subject$
    }

  schemaQuerySnapshotSubjectFactory =
    <TCollectionSchema extends CollectionSchema, TOptions extends MetaOutputOptions>(
      factory: SchemaFirestoreQueryFactory<TCollectionSchema>,
      query: QuerySpecification,
      options?: TOptions & SnapshotListenOptions,
      listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>,
    ) =>
    (queryKey: QueryKey) => {
      const subject$ = schemaQuerySnapshotSubject(factory, query, options, listener)
      this.registerSnapshotOnClose(queryKey, () => {
        subject$.close()
      })
      return subject$
    }
}
