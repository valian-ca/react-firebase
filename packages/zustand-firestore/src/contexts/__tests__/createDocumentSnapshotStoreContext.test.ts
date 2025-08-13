import { useContext } from 'react'

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createDocumentSnapshotStoreContext } from '../createDocumentSnapshotStoreContext'

describe('createDocumentSnapshotStoreContext', () => {
  it('returns a context holding a zustand store', () => {
    const Ctx = createDocumentSnapshotStoreContext()
    const { result } = renderHook(() => useContext(Ctx))
    expect(result.current.getState()).toEqual({
      isLoading: false,
      hasError: false,
      disabled: true,
    })
  })
})
