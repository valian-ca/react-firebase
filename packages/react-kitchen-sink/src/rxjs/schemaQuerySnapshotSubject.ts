import { type SnapshotListenOptions } from '@firebase/firestore'
import { fromQuery, QuerySnapshotSubject } from '@valian/rxjs-firebase'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaFirestoreQueryFactory,
  type SchemaQuerySpecification,
} from 'zod-firebase'

import { sentrySchemaQuerySnapshotListener } from '../sentry/sentrySchemaQuerySnapshotListener'

import { type SchemaQuerySnapshotStateListener, type SchemaQuerySnapshotSubject } from './types'

export const schemaQuerySnapshotSubject = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
>(
  factory: SchemaFirestoreQueryFactory<TCollectionSchema>,
  query: SchemaQuerySpecification<TCollectionSchema, TOptions>,
  options?: TOptions & SnapshotListenOptions,
  listener?: SchemaQuerySnapshotStateListener<TCollectionSchema, TOptions>,
): SchemaQuerySnapshotSubject<TCollectionSchema, TOptions> => {
  const schemaQuery = factory.prepare(query, options)
  const snapshot$ = fromQuery(schemaQuery, options)
  return new QuerySnapshotSubject(snapshot$, sentrySchemaQuerySnapshotListener(factory.collectionName, query, listener))
}
