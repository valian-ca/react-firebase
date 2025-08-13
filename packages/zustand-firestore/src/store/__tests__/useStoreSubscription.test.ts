import { renderHook } from '@testing-library/react'
import { Subject } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { createStore } from 'zustand'

import { useStoreSubscription } from '../useStoreSubscription'

describe('useStoreSubscription', () => {
  it('updates the store with emitted values and resets on unmount', () => {
    const subject = new Subject<{ value: number }>()
    const store = createStore<{ value: number }>(() => ({ value: 0 }))

    const { unmount } = renderHook(() => {
      useStoreSubscription(store, subject.asObservable())
    })

    subject.next({ value: 1 })
    expect(store.getState()).toEqual({ value: 1 })

    unmount()
    expect(store.getState()).toEqual({ value: 0 })
  })
})
