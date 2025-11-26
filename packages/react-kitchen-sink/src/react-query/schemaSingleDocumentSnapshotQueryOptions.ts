import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SingleDocumentCollectionFactory,
} from 'zod-firebase'

import { type SchemaDocumentSnapshotState } from '../rxjs/types'

import { type DocumentSnapshotQueryOptions, documentSnapshotQueryOptions } from './documentSnapshotQueryOptions'

export interface SchemaSingleDocumentSnapshotQueryOptions<
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
  factory: SingleDocumentCollectionFactory<TCollectionSchema>
  snapshotOptions?: TOptions & SnapshotListenOptions
}

export const schemaSingleDocumentSnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaDocumentSnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>({
  factory,
  snapshotOptions,
  ...props
}: SchemaSingleDocumentSnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>) =>
  documentSnapshotQueryOptions({
    refFn: () => factory.read.doc(snapshotOptions),
    snapshotOptions,
    ...props,
  })
