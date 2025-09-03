import { type DocumentSnapshot } from '@firebase/firestore'
import { from, of } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { stub } from 'vitest-mock-extended'

import { type DocumentSnapshotState } from '../../states'
import { waitForData } from '../waitForData'

describe('waitForData', () => {
  it('resolves with the first value that is not loading and not disabled', async () => {
    const loading: DocumentSnapshotState = { isLoading: true, hasError: false, disabled: false }
    const ready: DocumentSnapshotState = {
      isLoading: false,
      hasError: false,
      disabled: false,
      exists: true,
      data: {},
      snapshot: stub<DocumentSnapshot>(),
    }

    const obs$ = from([loading, ready])

    const result = await waitForData(obs$)
    expect(result).toEqual(ready)
  })

  it('rejects if no suitable value is emitted (completes without data)', async () => {
    const loadingOnly: DocumentSnapshotState = { isLoading: true, hasError: false, disabled: false }

    const obs$ = of(loadingOnly)

    await expect(waitForData(obs$, 5)).rejects.toBeDefined()
  })
})
