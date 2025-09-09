import { type QueryFunctionContext, type QueryKey } from '@tanstack/react-query'
import { type Observable } from 'rxjs'

export type ObservableQueryFunction<
  T = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TObservable extends Observable<T> = Observable<T>,
> = (context: QueryFunctionContext<TQueryKey>) => TObservable
