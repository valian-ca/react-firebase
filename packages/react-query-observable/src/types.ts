import { type QueryFunctionContext, type QueryKey } from '@tanstack/react-query'
import { type Observable } from 'rxjs'

export type ObservableQueryFunction<
  T = unknown,
  TObservable extends Observable<T> = Observable<T>,
  TQueryKey extends QueryKey = QueryKey,
> = (context: QueryFunctionContext<TQueryKey>) => TObservable
