import { type DocumentData, type Query as FirestoreQuery, type SnapshotListenOptions } from '@firebase/firestore'
import { type DefaultError, type QueryKey } from '@tanstack/react-query'
import { type ObservableQueryOptions, observableQueryOptions } from '@valian/react-query-observable'
import {
  fromQuery,
  type QuerySnapshotState,
  querySnapshotState,
  type QuerySnapshotStateListener,
} from '@valian/rxjs-firebase'
import { of } from 'rxjs'

export interface QuerySnapshotQueryOptions<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    ObservableQueryOptions<QuerySnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>,
    'observableFn'
  > {
  query?: FirestoreQuery<AppModelType, DbModelType> | null
  snapshotOptions?: SnapshotListenOptions
  listener?: QuerySnapshotStateListener<AppModelType, DbModelType>
}

export const querySnapshotQueryOptions = <
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
  TError = DefaultError,
  TData = QuerySnapshotState<AppModelType, DbModelType>,
  TQueryKey extends QueryKey = QueryKey,
>({
  query,
  snapshotOptions,
  listener,
  ...props
}: QuerySnapshotQueryOptions<AppModelType, DbModelType, TError, TData, TQueryKey>) =>
  observableQueryOptions<QuerySnapshotState<AppModelType, DbModelType>, TError, TData, TQueryKey>({
    observableFn: () =>
      !query
        ? of({
            empty: true,
            size: 0,
            isLoading: false,
            hasError: false,
            disabled: true,
            data: [],
          } as const satisfies QuerySnapshotState<AppModelType, DbModelType>)
        : fromQuery(query, snapshotOptions).pipe(querySnapshotState(listener)),
    enabled: !!query,
    gcTime: 10_000,
    ...props,
    meta: {
      ...props.meta,
      type: 'snapshot',
      query,
    },
  })
