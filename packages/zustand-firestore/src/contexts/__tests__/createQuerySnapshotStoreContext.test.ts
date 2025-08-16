import { useContext } from 'react'

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createQuerySnapshotStoreContext } from '../createQuerySnapshotStoreContext'

describe('createQuerySnapshotStoreContext', () => {
  it('returns a context holding a zustand store', () => {
    const Ctx = createQuerySnapshotStoreContext()
    const { result } = renderHook(() => useContext(Ctx))
    expect(result.current.getState()).toEqual({
      empty: true,
      size: 0,
      isLoading: false,
      hasError: false,
      disabled: true,
      data: [],
    })
  })
})
