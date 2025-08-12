import { type DocumentSnapshotStateListener, type QuerySnapshotStateListener } from '@valian/rxjs-firebase'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
} from 'zod-firebase'

export type SchemaDocumentSnapshotStateListener<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> = DocumentSnapshotStateListener<
  SchemaDocumentOutput<TCollectionSchema, TOptions>,
  SchemaDocumentInput<TCollectionSchema>
>

export type SchemaQuerySnapshotStateListener<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions,
> = QuerySnapshotStateListener<
  SchemaDocumentOutput<TCollectionSchema, TOptions>,
  SchemaDocumentInput<TCollectionSchema>
>
