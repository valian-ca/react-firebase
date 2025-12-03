import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
} from 'zod-firebase'

import { type SchemaDocumentSnapshotState } from '../rxjs/types'

import { type DocumentSnapshotQueryOptions, documentSnapshotQueryOptions } from './documentSnapshotQueryOptions'

export interface SchemaDocumentSnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaDocumentSnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
  DocumentSnapshotQueryOptions<
    SchemaDocumentOutput<TCollectionSchema, TOptions>,
    SchemaDocumentInput<TCollectionSchema>,
    TError,
    TData,
    TQueryKey
  >,
  'ref' | 'refFn' | 'snapshotOptions'
> {
  factory: SchemaFirestoreFactory<TCollectionSchema>
  id?: string | null
  snapshotOptions?: TOptions & SnapshotListenOptions
}

export const schemaDocumentSnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaDocumentSnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>({
  factory,
  id,
  snapshotOptions,
  ...props
}: SchemaDocumentSnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>) =>
  documentSnapshotQueryOptions({
    ...(id ? { refFn: () => factory.read.doc(id, snapshotOptions) } : {}),
    snapshotOptions,
    ...props,
  })
