import { type DocumentReference, type DocumentSnapshot } from '@firebase/firestore'
import { renderHook } from '@testing-library/react'
import * as rx from '@valian/rxjs-firebase'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { mock, stub } from 'vitest-mock-extended'

import { useDocumentStore } from '../useDocumentStore'

describe('useDocumentStore', () => {
  interface TestDocument {
    value: string
  }

  it('returns disabled state when ref is nullish', () => {
    const { result } = renderHook(() => useDocumentStore({ ref: null }))
    expect(result.current.getState()).toEqual({ isLoading: false, hasError: false, disabled: true })
  })

  it('subscribes to document state when ref is provided', () => {
    const subject = new Subject<DocumentSnapshot<TestDocument>>()
    vi.spyOn(rx, 'fromDocumentRef').mockReturnValue(subject.asObservable())

    const { result } = renderHook(() => useDocumentStore({ ref: stub<DocumentReference>() }))

    const snapshot = mock<DocumentSnapshot<TestDocument>>()
    snapshot.exists.mockReturnValue(true)
    snapshot.data.mockReturnValue({ value: 'test' })
    subject.next(snapshot)

    expect(result.current.getState()).toEqual({
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: true,
      data: { value: 'test' },
      snapshot,
    })
  })
})
