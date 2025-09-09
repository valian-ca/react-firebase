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

import {
  type DocumentSnapshotQueryOptions,
  documentSnapshotQueryOptions,
  type QueryFnFromDocumentSnapshotSubjectFactoryOptions,
} from './documentSnapshotQueryOptions'

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
      'ref' | 'snapshotOptions'
    >,
    QueryFnFromDocumentSnapshotSubjectFactoryOptions {
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
    ref: id ? factory.read.doc(id, snapshotOptions) : null,
    snapshotOptions,
    ...props,
  })
