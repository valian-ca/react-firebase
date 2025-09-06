import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queriesSubscriptions } from '../queryFn/queriesWithObservable'

describe('queriesWithObservable', () => {
  beforeEach(() => {
    queriesSubscriptions.clear()
  })

  it('stores and deletes subscriptions by hash key', () => {
    const unsubscribe = vi.fn()
    queriesSubscriptions.set('key', { unsubscribe })
    expect(queriesSubscriptions.get('key')).toEqual({ unsubscribe })

    queriesSubscriptions.delete('key')
    expect(queriesSubscriptions.has('key')).toBe(false)
  })
})
