import { type DefaultError, type QueryKey, queryOptions, type UnusedSkipTokenOptions } from '@tanstack/react-query'

import { queryFnFromObservableFn } from './queryFn/observableQueryFn'
import { type ObservableQueryFunction } from './types'

export interface ObservableQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UnusedSkipTokenOptions<TQueryFnData, TError, TData, TQueryKey>,
    | 'queryFn'
    | 'staleTime'
    | 'refetchInterval'
    | 'refetchIntervalInBackground'
    | 'refetchOnWindowFocus'
    | 'refetchOnMount'
    | 'refetchOnReconnect'
    | 'retryOnMount'
    | 'retry'
  > {
  observableFn: ObservableQueryFunction<TQueryFnData, TQueryKey>
}

export const observableQueryOptions = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: ObservableQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
) =>
  queryOptions({
    queryFn: queryFnFromObservableFn(options.observableFn),
    retry: false,
    staleTime: ({ state }) => (state.dataUpdateCount > 0 ? Infinity : 0),
    gcTime: 10_000,
    ...options,
  })
