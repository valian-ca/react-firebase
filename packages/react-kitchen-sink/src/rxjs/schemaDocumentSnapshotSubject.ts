import { type SnapshotListenOptions } from '@firebase/firestore'
import { type CollectionSchema, type MetaOutputOptions, type SchemaFirestoreFactory } from 'zod-firebase'

import { documentSnapshotSubject } from './documentSnapshotSubject'
import { type SchemaDocumentSnapshotStateListener, type SchemaDocumentSnapshotSubject } from './types'

export const schemaDocumentSnapshotSubject = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
>(
  factory: SchemaFirestoreFactory<TCollectionSchema>,
  id: string,
  options?: TOptions & SnapshotListenOptions,
  listener?: SchemaDocumentSnapshotStateListener<TCollectionSchema, TOptions>,
): SchemaDocumentSnapshotSubject<TCollectionSchema, TOptions> =>
  documentSnapshotSubject(factory.read.doc(id, options), options, listener)
