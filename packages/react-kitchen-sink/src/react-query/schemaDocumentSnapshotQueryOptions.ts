import { type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import {
  type CollectionSchema,
  type MetaOutputOptions,
  type SchemaDocumentInput,
  type SchemaDocumentOutput,
  type SchemaFirestoreFactory,
} from 'zod-firebase'

import { type SchemaQuerySnapshotState } from '../rxjs/types'

import { type QueryFnFromDocumentSnapshotSubjectFactoryOptions } from './queryFn/queryFnFromDocumentSnapshotSubjectFactory'
import {
  type DocumentSnapshotQueryOptions,
  documentSnapshotQueryOptions,
  type DocumentSnapshotQueryOptionsResult,
} from './documentSnapshotQueryOptions'
import { type FirestoreSnapshotManager } from './FirestoreSnapshotManager'

export interface SchemaDocumentSnapshotQueryOptions<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
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
  id: string
  snapshotOptions?: TOptions & SnapshotListenOptions
}

export type SchemaDocumentSnapshotQueryOptionsResult<
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
> = DocumentSnapshotQueryOptionsResult<
  SchemaDocumentOutput<TCollectionSchema, TOptions>,
  SchemaDocumentInput<TCollectionSchema>,
  TError,
  TData,
  TQueryKey
>

export const schemaDocumentSnapshotQueryOptions = <
  TCollectionSchema extends CollectionSchema,
  TOptions extends MetaOutputOptions = MetaOutputOptions,
  TError = DefaultError,
  TData = SchemaQuerySnapshotState<TCollectionSchema, TOptions>,
  TQueryKey extends QueryKey = QueryKey,
>(
  snapshotManager: FirestoreSnapshotManager,
  {
    factory,
    id,
    snapshotOptions,
    ...props
  }: SchemaDocumentSnapshotQueryOptions<TCollectionSchema, TOptions, TError, TData, TQueryKey>,
): SchemaDocumentSnapshotQueryOptionsResult<TCollectionSchema, TOptions, TError, TData, TQueryKey> =>
  documentSnapshotQueryOptions(snapshotManager, {
    ref: factory.read.doc(id, snapshotOptions),
    snapshotOptions,
    ...props,
  })
