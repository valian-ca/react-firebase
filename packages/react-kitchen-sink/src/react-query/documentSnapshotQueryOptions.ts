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

export interface DocumentSnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = DocumentSnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    ObservableQueryOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
    'observableFn'
  > {
  ref?: DocumentReference<AppModelType, DbModelType> | null
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
  snapshotOptions,
  listener,
  ...props
}: DocumentSnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>) =>
  observableQueryOptions<DocumentSnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>({
    observableFn: () =>
      !ref
        ? of({ isLoading: false, hasError: false, disabled: true } as const satisfies DocumentSnapshotState<
            AppModelType,
            DbModelType
          >)
        : fromDocumentRef(ref, snapshotOptions).pipe(
            documentSnapshotState(sentryDocumentSnapshotListener(ref, listener)),
          ),
    enabled: !!ref,
    gcTime: 10_000,
    ...props,
    meta: {
      ...props.meta,
      type: 'snapshot',
      documentRef: ref,
    },
  })
