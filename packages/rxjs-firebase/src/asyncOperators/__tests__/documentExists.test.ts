import { type DocumentSnapshot } from '@firebase/firestore'
import { of } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { stub } from 'vitest-mock-extended'

import { type DocumentSnapshotState } from '../../states'
import { documentExists } from '../documentExists'

describe('documentExists', () => {
  it('returns true when state has exists true', async () => {
    const ready: DocumentSnapshotState = {
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: true,
      data: {},
      snapshot: stub<DocumentSnapshot>(),
    }
    const result = await documentExists(of(ready))
    expect(result).toBe(true)
  })

  it('returns false when state has exists false', async () => {
    const ready: DocumentSnapshotState = {
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: false,
      snapshot: stub<DocumentSnapshot>(),
    }
    const result = await documentExists(of(ready))
    expect(result).toBe(false)
  })
})
