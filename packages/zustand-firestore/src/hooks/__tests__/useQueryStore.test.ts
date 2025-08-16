import { type Query, type QueryDocumentSnapshot, type QuerySnapshot } from '@firebase/firestore'
import { renderHook } from '@testing-library/react'
import * as rx from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { useQueryStore } from '../useQueryStore'

interface TestDocument {
  value: string
}

describe('useQueryStore', () => {
  it('returns disabled empty state when query is nullish', () => {
    const { result } = renderHook(() => useQueryStore({ query: null }))
    expect(result.current.getState()).toEqual({
      empty: true,
      size: 0,
      isLoading: false,
      hasError: false,
      disabled: true,
      data: [],
    })
  })

  it('subscribes to query state when query is provided', () => {
    const subject = new Subject<QuerySnapshot<TestDocument>>()
    vi.spyOn(rx, 'fromQuery').mockReturnValue(subject.asObservable())

    const { result } = renderHook(() => useQueryStore({ query: stub<Query>() }))

    const queryDocumentSnapshot = mock<QueryDocumentSnapshot<TestDocument>>()
    queryDocumentSnapshot.data.mockReturnValue({ value: 'test' })
    queryDocumentSnapshot.exists.mockReturnValue(true)
    const querySnapshot = mock<QuerySnapshot<TestDocument>>({
      size: 1,
      empty: false,
      docs: [queryDocumentSnapshot],
    })
    subject.next(querySnapshot)

    expect(result.current.getState()).toEqual({
      empty: false,
      size: 1,
      isLoading: false,
      hasError: false,
      disabled: false,
      data: [{ value: 'test' }],
      snapshot: querySnapshot,
    })
  })
})
