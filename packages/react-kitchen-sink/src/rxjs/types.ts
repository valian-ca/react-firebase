import {
  type DocumentSnapshotState,
  type DocumentSnapshotStateListener,
  type DocumentSnapshotSubject,
  type QuerySnapshotState,
  type QuerySnapshotStateListener,
  type QuerySnapshotSubject,
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

export type SchemaDocumentSnapshotSubject<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = DocumentSnapshotSubject<SchemaDocumentOutput<TCollectionSchema, TOptions>, SchemaDocumentInput<TCollectionSchema>>

export type SchemaQuerySnapshotSubject<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
> = QuerySnapshotSubject<SchemaDocumentOutput<TCollectionSchema, TOptions>, SchemaDocumentInput<TCollectionSchema>>

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
