import { QueryClient } from '@tanstack/react-query'
import { BehaviorSubject, Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { observableQueryOptions } from '../observableQueryOptions'
import { queriesSubscriptions } from '../queryFn/queriesWithObservable'

describe('QueryClient', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    queriesSubscriptions.clear()
    Date.now = vi.fn(() => 1_482_363_367_071)
  })

  it('resolves with the first emitted value and sets subsequent emissions to cache', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn })
    const promise = queryClient.fetchQuery(queryOptions)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "fetching",
        "isInvalidated": false,
        "status": "pending",
      }
    `)

    subject.next(1)
    await expect(promise).resolves.toBe(1)

    subject.next(2)
    subject.next(3)
    await expect(queryClient.fetchQuery(queryOptions)).resolves.toBe(3)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 3,
        "dataUpdateCount": 3,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "success",
      }
    `)
  })

  it('resolve first then emits an error: sets query state to error', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn })
    const promise = queryClient.fetchQuery(queryOptions)

    subject.next(1)
    await expect(promise).resolves.toBe(1)

    subject.error(new Error('boom'))

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "dataUpdateCount": 1,
        "dataUpdatedAt": 1482363367071,
        "error": [Error: boom],
        "errorUpdateCount": 1,
        "errorUpdatedAt": 1482363367071,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "error",
      }
    `)
  })

  it('resolves with the first error emitted by the observable', async () => {
    const subject = new BehaviorSubject<number>(1)
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn })
    await expect(queryClient.fetchQuery(queryOptions)).resolves.toBe(1)

    subject.error(new Error('boom'))
    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "dataUpdateCount": 1,
        "dataUpdatedAt": 1482363367071,
        "error": [Error: boom],
        "errorUpdateCount": 1,
        "errorUpdatedAt": 1482363367071,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "error",
      }
    `)
  })

  it('should work with initial value', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn, initialData: 42 })
    const promise = queryClient.fetchQuery(queryOptions)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 42,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "fetching",
        "isInvalidated": false,
        "status": "success",
      }
    `)

    subject.next(43)
    await expect(promise).resolves.toBe(43)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 43,
        "dataUpdateCount": 1,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "success",
      }
    `)
  })

  it('should work with initial value and ensureQueryData', async () => {
    const subject = new Subject<number>()
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn, initialData: 42 })
    const ensurePromise = queryClient.ensureQueryData(queryOptions)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 42,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "success",
      }
    `)

    subject.next(43)
    await expect(ensurePromise).resolves.toBe(42)

    const fetchPromise = queryClient.fetchQuery(queryOptions)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 42,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "fetching",
        "isInvalidated": false,
        "status": "success",
      }
    `)

    subject.next(44)
    await expect(fetchPromise).resolves.toBe(44)

    expect(queryClient.getQueryState(queryOptions.queryKey)).toMatchInlineSnapshot(`
      {
        "data": 44,
        "dataUpdateCount": 1,
        "dataUpdatedAt": 1482363367071,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchFailureReason": null,
        "fetchMeta": null,
        "fetchStatus": "idle",
        "isInvalidated": false,
        "status": "success",
      }
    `)
  })

  it('should unsubscribes from the observable when the query is removed from the cache', async () => {
    const subject = new BehaviorSubject<number>(1)
    const observableFn = vi.fn().mockReturnValue(subject)

    const queryOptions = observableQueryOptions({ queryKey: ['observable', 1], observableFn })

    await expect(queryClient.fetchQuery(queryOptions)).resolves.toBe(1)

    expect(subject.observed).toBe(true)
    queryClient.removeQueries({ queryKey: queryOptions.queryKey })
    expect(subject.observed).toBe(false)
  })
})
