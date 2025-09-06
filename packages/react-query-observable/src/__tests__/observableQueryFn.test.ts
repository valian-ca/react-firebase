import { type QueryCacheNotifyEvent, QueryClient, type QueryFunctionContext } from '@tanstack/react-query'
import { config as rxjsConfig, Observable, Subject, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryFnFromObservableFn } from '../queryFn/observableQueryFn'
import { queriesSubscriptions } from '../queryFn/queriesWithObservable'

const queryKey = ['observable', 1] as const

describe('queryFnFromObservableFn', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    queriesSubscriptions.clear()
  })

  const createContext = (): QueryFunctionContext<typeof queryKey> => ({
    queryKey,
    meta: undefined,
    signal: new AbortController().signal,
    pageParam: undefined,
    client: queryClient,
  })

  it('resolves with the first emitted value and sets subsequent emissions to cache', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)
    const queryFn = queryFnFromObservableFn(observableFn)

    const promise = queryFn(createContext())

    subject.next(1)
    await expect(promise).resolves.toBe(1)

    subject.next(2)
    subject.next(3)

    expect(queryClient.getQueryData(queryKey)).toBe(3)
  })

  it('unsubscribes previous subscription for same queryKey before creating a new one', async () => {
    const firstSubject = new Subject<number>()
    const secondSubject = new Subject<number>()

    const observableFn = vi.fn().mockReturnValueOnce(firstSubject).mockReturnValueOnce(secondSubject)

    const queryFn = queryFnFromObservableFn(observableFn)

    const p1 = queryFn(createContext())
    firstSubject.next(10)
    await expect(p1).resolves.toBe(10)

    const p2 = queryFn(createContext())
    // previous subject should have been unsubscribed
    expect(firstSubject.observed).toBe(false)
    expect(secondSubject.observed).toBe(true)

    secondSubject.next(20)
    await expect(p2).resolves.toBe(20)
  })

  it('rejects if the observable errors before first value', async () => {
    const error = new Error('boom')
    const observableFn = vi.fn(() => throwError(() => error))
    const queryFn = queryFnFromObservableFn(observableFn)

    await expect(queryFn(createContext())).rejects.toBe(error)
  })

  it('throws "Query not found" when error occurs after first value and query is not registered', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)
    const queryFn = queryFnFromObservableFn(observableFn)

    const promise = queryFn(createContext())
    subject.next(1)
    await expect(promise).resolves.toBe(1)

    let captured: unknown
    const originalHandler = rxjsConfig.onUnhandledError
    rxjsConfig.onUnhandledError = (err) => {
      captured = err
    }
    subject.error(new Error('late-error'))
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0)
    })
    expect((captured as Error).message).toBe('Query not found')
    rxjsConfig.onUnhandledError = originalHandler
  })

  it('rejects if observable completes without emitting a value', async () => {
    const observableFn = vi.fn(
      () =>
        new Observable<number>((subscriber) => {
          subscriber.complete()
        }),
    )
    const queryFn = queryFnFromObservableFn(observableFn)

    await expect(queryFn(createContext())).rejects.toThrow('Observable completed without returning a value')
  })

  it('cleans up subscription when query is removed from cache', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)
    const queryFn = queryFnFromObservableFn(observableFn)

    // Spy on subscribe to capture the notify callback
    const cache = queryClient.getQueryCache()
    const subscribeSpy = vi.spyOn(cache, 'subscribe')

    const promise = queryFn(createContext())
    subject.next(123)
    await expect(promise).resolves.toBe(123)

    expect(queriesSubscriptions.size).toBe(1)

    // Simulate a 'removed' event from the cache to trigger cleanup
    const captured = subscribeSpy.mock.calls.at(-1)?.[0]
    captured?.({ type: 'removed', query: { queryKey } } as QueryCacheNotifyEvent)

    expect(queriesSubscriptions.size).toBe(0)

    subscribeSpy.mockRestore()
  })
})
