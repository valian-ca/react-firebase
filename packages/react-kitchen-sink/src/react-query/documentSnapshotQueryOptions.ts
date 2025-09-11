import { type DocumentData, type DocumentReference, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import { type ObservableQueryOptions, observableQueryOptions } from '@valian/react-query-observable'
import {
  type DocumentSnapshotState,
  documentSnapshotState,
  type DocumentSnapshotStateListener,
  fromDocumentRef,
} from '@valian/rxjs-firebase'
import { of } from 'rxjs'

import { sentryDocumentSnapshotListener } from '../sentry'

type DocumentSnapshotQueryRef<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> =
  | {
      ref?: DocumentReference<AppModelType, DbModelType> | null
      refFn?: never
    }
  | {
      ref?: never
      refFn: () => DocumentReference<AppModelType, DbModelType>
    }

export type DocumentSnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  ObservableQueryOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
  'observableFn'
> &
  DocumentSnapshotQueryRef<AppModelType, DbModelType> & {
    snapshotOptions?: SnapshotListenOptions
    listener?: DocumentSnapshotStateListener<AppModelType, DbModelType>
  }

export const documentSnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>({
  ref,
  refFn,
  snapshotOptions,
  listener,
  ...props
}: DocumentSnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>) =>
  observableQueryOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>({
    observableFn: () => {
      if (refFn) {
        return fromDocumentRef(refFn(), snapshotOptions).pipe(
          documentSnapshotState(sentryDocumentSnapshotListener(refFn(), listener)),
        )
      }
      if (ref) {
        return fromDocumentRef(ref, snapshotOptions).pipe(
          documentSnapshotState(sentryDocumentSnapshotListener(ref, listener)),
        )
      }
      return of({ isLoading: false, hasError: false, disabled: true } as const satisfies DocumentSnapshotState<
        AppModelType,
        DbModelType
      >)
    },
    enabled: !!ref,
    gcTime: 10_000,
    ...props,
    meta: {
      ...props.meta,
      type: 'snapshot',
      documentRef: ref,
    },
  })
