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
    staleTime: ({ state }) => (state.dataUpdateCount === 0 || state.status === 'error' ? 0 : Infinity),
    gcTime: 10_000,
    ...options,
  })
