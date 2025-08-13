import { createContext } from 'react'

import { renderHook } from '@testing-library/react'
import { Subject } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { createStore, type StoreApi } from 'zustand'

import { useContextStoreSubscription } from '../useContextStoreSubscription'

describe('useContextStoreSubscription', () => {
  it('subscribes to context store and updates state', () => {
    const subject = new Subject<{ value: number }>()
    const store = createStore<{ value: number }>(() => ({ value: 0 }))
    const Ctx = createContext<StoreApi<{ value: number }>>(store)

    renderHook(() => {
      useContextStoreSubscription(Ctx, subject.asObservable())
    })
    subject.next({ value: 2 })
    expect(store.getState()).toEqual({ value: 2 })
  })
})
