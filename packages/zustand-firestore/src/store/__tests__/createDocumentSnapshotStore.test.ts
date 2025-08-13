import { describe, expect, it } from 'vitest'

import { createDocumentSnapshotStore } from '../createDocumentSnapshotStore'

describe('createDocumentSnapshotStore', () => {
  it('creates a store with initial state', () => {
    const store = createDocumentSnapshotStore()
    expect(store.getState()).toEqual({
      isLoading: false,
      hasError: false,
      disabled: true,
    })
  })
})
