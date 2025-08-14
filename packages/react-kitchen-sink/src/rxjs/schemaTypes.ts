import {
  type DocumentSnapshotState,
  type DocumentSnapshotStateListener,
  type QuerySnapshotState,
  type QuerySnapshotStateListener,
} from '@valian/rxjs-firebase'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
} from 'zod-firebase'

export type SchemaDocumentSnapshotState<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = DocumentSnapshotState<SchemaDocumentOutput<TCollectionSchema, TOptions>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaQuerySnapshotState<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = QuerySnapshotState<SchemaDocumentOutput<TCollectionSchema, TOptions>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaDocumentSnapshotStateListener<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = DocumentSnapshotStateListener<
  SchemaDocumentOutput<TCollectionSchema, TOptions>,
  SchemaDocumentInput<TCollectionSchema>
>

export type SchemaQuerySnapshotStateListener<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = QuerySnapshotStateListener<
  SchemaDocumentOutput<TCollectionSchema, TOptions>,
  SchemaDocumentInput<TCollectionSchema>
>
