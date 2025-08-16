import { describe, expect, it } from 'vitest'

import { createQuerySnapshotStore } from '../createQuerySnapshotStore'

describe('createQuerySnapshotStore', () => {
  it('creates a store with initial state', () => {
    const store = createQuerySnapshotStore()
    expect(store.getState()).toEqual({
      empty: true,
      size: 0,
      isLoading: false,
      hasError: false,
      disabled: true,
      data: [],
    })
  })
})
