import { hashKey, type QueryCacheNotifyEvent, type QueryFunction, type QueryKey } from '@tanstack/react-query'
import { type Observable } from 'rxjs'

import { type ObservableQueryFunction } from '../types'

import { queriesSubscriptions } from './queriesWithObservable'

export const queryFnFromObservableFn =
  <T = unknown, TObservable extends Observable<T> = Observable<T>, TQueryKey extends QueryKey = QueryKey>(
    observableFn: ObservableQueryFunction<T, TObservable, TQueryKey>,
    onUnsubscribe?: (observable$: TObservable) => void,
  ): QueryFunction<T, TQueryKey> =>
  async (context) => {
    const queryKeyHash = hashKey(context.queryKey)
    queriesSubscriptions.get(queryKeyHash)?.unsubscribe()
    return new Promise<T>((resolve, reject) => {
      if (context.signal.aborted) {
        reject(new Error('Query aborted'))
        return
      }
      let firstValueReturned = false
      const observable$ = observableFn(context)
      const subscription = observable$.subscribe({
        next: (data) => {
          if (!firstValueReturned) {
            firstValueReturned = true
            resolve(data)
          } else {
            context.client.setQueryData<T>(context.queryKey, data)
          }
        },
        error: (error) => {
          if (!firstValueReturned) {
            firstValueReturned = true
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error)
          } else {
            // After the first value has been resolved, propagate the error into the query state
            const query = context.client.getQueryCache().find({ queryKey: context.queryKey })
            if (!query) {
              throw new Error('Query not found', { cause: error })
            } else {
              query.setState({
                ...query.state,
                data: undefined,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                error,
                errorUpdateCount: query.state.errorUpdateCount + 1,
                errorUpdatedAt: Date.now(),
                fetchStatus: 'idle',
                isInvalidated: false,
                status: 'error',
              })
            }
          }
        },
        complete: () => {
          if (!firstValueReturned) reject(new Error('Observable completed without returning a value'))
        },
      })
      const unsubscribeFromQueryCache = context.client.getQueryCache().subscribe((event: QueryCacheNotifyEvent) => {
        if (event.type === 'removed' && queryKeyHash === hashKey(event.query.queryKey as QueryKey)) {
          unsubscribe()
        }
      })
      const abortListener = () => {
        unsubscribe()
        if (!firstValueReturned) reject(new Error('Query aborted'))
      }
      context.signal.addEventListener('abort', abortListener, { once: true })
      const unsubscribe = () => {
        unsubscribeFromQueryCache()
        subscription.unsubscribe()
        queriesSubscriptions.delete(queryKeyHash)
        context.signal.removeEventListener('abort', abortListener)
        onUnsubscribe?.(observable$)
      }
      queriesSubscriptions.set(queryKeyHash, { unsubscribe })
    })
  }
