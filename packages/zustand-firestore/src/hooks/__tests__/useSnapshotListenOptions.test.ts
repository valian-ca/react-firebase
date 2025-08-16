import { type SnapshotListenOptions } from '@firebase/firestore'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSnapshotListenOptions } from '../useSnapshotListenOptions'

describe('useSnapshotListenOptions', () => {
  it('returns empty options when all undefined', () => {
    const { result, rerender } = renderHook(() => useSnapshotListenOptions({}))
    const memoized = result.current
    expect(memoized).toEqual({})

    rerender({})
    expect(result.current).toBe(memoized)
  })

  it('keeps only defined fields', () => {
    const { result, rerender } = renderHook((props) => useSnapshotListenOptions(props), {
      initialProps: { includeMetadataChanges: true } as SnapshotListenOptions,
    })
    expect(result.current).toEqual({ includeMetadataChanges: true })

    rerender({ includeMetadataChanges: true, source: 'default' })
    expect(result.current).toEqual({ includeMetadataChanges: true, source: 'default' })

    rerender({ source: 'default' })
    expect(result.current).toEqual({ source: 'default' })
  })
})
