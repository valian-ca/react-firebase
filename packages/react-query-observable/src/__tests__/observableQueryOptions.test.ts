import { type Query } from '@tanstack/react-query'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'

import { observableQueryOptions } from '../observableQueryOptions'
import { queriesSubscriptions } from '../queryFn/queriesWithObservable'

describe('observableQueryOptions', () => {
  const queryKey = ['test', 1] as const

  beforeEach(() => {
    queriesSubscriptions.clear()
  })

  it('should create a query options object with defaults and queryFn', () => {
    const options = observableQueryOptions({
      queryKey,
      observableFn: () => of('value'),
    })

    expect(typeof options.queryFn).toBe('function')
    expect(options.gcTime).toBe(10_000)

    const staleTimeValue =
      typeof options.staleTime === 'function'
        ? options.staleTime(
            mock<Query<string, Error, string, typeof queryKey>>({ state: { dataUpdateCount: 0 }, queryKey }),
          )
        : options.staleTime
    expect(staleTimeValue).toBe(0)
  })

  it('should set staleTime to Infinity when the query has updated data', () => {
    const options = observableQueryOptions({
      queryKey,
      observableFn: () => of('value'),
    })

    const staleTimeValue =
      typeof options.staleTime === 'function'
        ? options.staleTime(
            mock<Query<string, Error, string, typeof queryKey>>({ state: { dataUpdateCount: 1 }, queryKey }),
          )
        : options.staleTime
    expect(staleTimeValue).toBe(Infinity)
  })

  it('should allow overriding gcTime option', () => {
    const options = observableQueryOptions({
      queryKey,
      observableFn: () => of('value'),
      gcTime: 1234,
    })

    expect(options.gcTime).toBe(1234)
  })
})
